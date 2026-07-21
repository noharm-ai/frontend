/**
 * Safe aggregation-expression engine for chart value series.
 *
 * An expression combines per-group aggregation functions with arithmetic,
 * e.g. `contagem()`, `soma(dose)`, `contagem(a) / contagem(b) * 100`.
 * Functions are exposed in Portuguese (contagem, soma, media, minimo, maximo)
 * but English aliases are also accepted silently.
 *
 * The engine is a hand-written tokenizer + recursive-descent parser + tree
 * evaluator. It intentionally avoids `eval`/`new Function`: expressions come
 * from persisted config and must never execute arbitrary code.
 */

import type { ColumnSchema } from "src/utils/dataFilters";

// --- AST ---

export type AggFn = "count" | "sum" | "avg" | "min" | "max";

export type ExprNode =
  | { kind: "number"; value: number }
  | { kind: "unary"; op: "-"; operand: ExprNode }
  | { kind: "binary"; op: "+" | "-" | "*" | "/"; left: ExprNode; right: ExprNode }
  | { kind: "agg"; fn: AggFn; column: string | null };

// --- Function metadata (used by the UI chips too) ---

export interface AggFunctionInfo {
  fn: AggFn;
  /** Portuguese label shown in the builder. */
  label: string;
  /** count works with or without a column; the others require one. */
  columnRequired: boolean;
}

export const AGG_FUNCTIONS: AggFunctionInfo[] = [
  { fn: "count", label: "contagem", columnRequired: false },
  { fn: "sum", label: "soma", columnRequired: true },
  { fn: "avg", label: "media", columnRequired: true },
  { fn: "min", label: "minimo", columnRequired: true },
  { fn: "max", label: "maximo", columnRequired: true },
];

const AGG_LABEL: Record<AggFn, string> = {
  count: "contagem",
  sum: "soma",
  avg: "media",
  min: "minimo",
  max: "maximo",
};

const stripAccents = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const FN_ALIASES: Record<string, AggFn> = {
  count: "count",
  contagem: "count",
  sum: "sum",
  soma: "sum",
  avg: "avg",
  media: "avg",
  mean: "avg",
  min: "min",
  minimo: "min",
  max: "max",
  maximo: "max",
};

export const canonicalFn = (name: string): AggFn | null =>
  FN_ALIASES[stripAccents(name).toLowerCase()] ?? null;

// --- Tokenizer ---

type TokenType =
  | "number"
  | "ident"
  | "op"
  | "lparen"
  | "rparen"
  | "comma";

interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

const SPECIAL = new Set(["+", "-", "*", "/", "(", ")", ",", '"']);

class ExprError extends Error {}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = input.length;

  while (i < n) {
    const c = input[i];

    if (c === " " || c === "\t" || c === "\n" || c === "\r") {
      i++;
      continue;
    }

    if (c === "(" || c === ")" || c === ",") {
      tokens.push({
        type: c === "(" ? "lparen" : c === ")" ? "rparen" : "comma",
        value: c,
        pos: i,
      });
      i++;
      continue;
    }

    if (c === "+" || c === "-" || c === "*" || c === "/") {
      tokens.push({ type: "op", value: c, pos: i });
      i++;
      continue;
    }

    // number
    if (c >= "0" && c <= "9") {
      let j = i + 1;
      while (j < n && ((input[j] >= "0" && input[j] <= "9") || input[j] === ".")) {
        j++;
      }
      tokens.push({ type: "number", value: input.slice(i, j), pos: i });
      i = j;
      continue;
    }

    // quoted identifier (column with spaces / special chars)
    if (c === '"') {
      let j = i + 1;
      while (j < n && input[j] !== '"') j++;
      if (j >= n) {
        throw new ExprError(`Aspas não fechadas na posição ${i + 1}.`);
      }
      tokens.push({ type: "ident", value: input.slice(i + 1, j), pos: i });
      i = j + 1;
      continue;
    }

    // bare identifier: run of non-special, non-space chars
    let j = i;
    while (j < n && !SPECIAL.has(input[j]) && !/\s/.test(input[j])) j++;
    tokens.push({ type: "ident", value: input.slice(i, j), pos: i });
    i = j;
  }

  return tokens;
}

// --- Recursive-descent parser ---

class Parser {
  private pos = 0;
  constructor(private tokens: Token[]) {}

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private next(): Token | undefined {
    return this.tokens[this.pos++];
  }

  parse(): ExprNode {
    const node = this.parseExpression();
    const rest = this.peek();
    if (rest) {
      throw new ExprError(`Token inesperado "${rest.value}".`);
    }
    return node;
  }

  // + and -
  private parseExpression(): ExprNode {
    let left = this.parseTerm();
    let tok = this.peek();
    while (tok && tok.type === "op" && (tok.value === "+" || tok.value === "-")) {
      this.next();
      const right = this.parseTerm();
      left = { kind: "binary", op: tok.value as "+" | "-", left, right };
      tok = this.peek();
    }
    return left;
  }

  // * and /
  private parseTerm(): ExprNode {
    let left = this.parseFactor();
    let tok = this.peek();
    while (tok && tok.type === "op" && (tok.value === "*" || tok.value === "/")) {
      this.next();
      const right = this.parseFactor();
      left = { kind: "binary", op: tok.value as "*" | "/", left, right };
      tok = this.peek();
    }
    return left;
  }

  private parseFactor(): ExprNode {
    const tok = this.peek();
    if (!tok) throw new ExprError("Expressão incompleta.");

    // unary minus
    if (tok.type === "op" && tok.value === "-") {
      this.next();
      return { kind: "unary", op: "-", operand: this.parseFactor() };
    }
    // unary plus (ignore)
    if (tok.type === "op" && tok.value === "+") {
      this.next();
      return this.parseFactor();
    }

    if (tok.type === "lparen") {
      this.next();
      const node = this.parseExpression();
      const close = this.next();
      if (!close || close.type !== "rparen") {
        throw new ExprError("Parêntese ')' esperado.");
      }
      return node;
    }

    if (tok.type === "number") {
      this.next();
      const value = Number(tok.value);
      if (isNaN(value)) throw new ExprError(`Número inválido "${tok.value}".`);
      return { kind: "number", value };
    }

    if (tok.type === "ident") {
      this.next();
      const fn = canonicalFn(tok.value);
      const after = this.peek();
      if (!after || after.type !== "lparen") {
        if (fn) {
          throw new ExprError(`"${tok.value}" precisa de parênteses, ex.: ${tok.value}(coluna).`);
        }
        throw new ExprError(
          `"${tok.value}" deve estar dentro de uma função de agregação, ex.: soma(${tok.value}).`,
        );
      }
      if (!fn) {
        throw new ExprError(`Função desconhecida "${tok.value}".`);
      }
      this.next(); // consume '('
      let column: string | null = null;
      const arg = this.peek();
      if (arg && arg.type === "ident") {
        column = arg.value;
        this.next();
      } else if (arg && arg.type === "number") {
        throw new ExprError(`"${arg.value}" não é um nome de coluna válido.`);
      }
      const close = this.next();
      if (!close || close.type !== "rparen") {
        throw new ExprError(`Parêntese ')' esperado após ${tok.value}(...).`);
      }
      if (fn !== "count" && column === null) {
        throw new ExprError(`${tok.value}() precisa de uma coluna, ex.: ${tok.value}(coluna).`);
      }
      return { kind: "agg", fn, column };
    }

    throw new ExprError(`Token inesperado "${tok.value}".`);
  }
}

// --- Public compile / eval API ---

export interface CompileResult {
  ast?: ExprNode;
  error?: string;
}

export function compileExpr(expr: string): CompileResult {
  const trimmed = (expr ?? "").trim();
  if (!trimmed) return { error: "Expressão vazia." };
  try {
    const ast = new Parser(tokenize(trimmed)).parse();
    return { ast };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Expressão inválida." };
  }
}

const isPresent = (v: any) => v !== null && v !== undefined && v !== "";

const numericValues = (items: any[], column: string): number[] =>
  items.map((it) => Number(it[column])).filter((v) => !isNaN(v));

function evalAgg(node: Extract<ExprNode, { kind: "agg" }>, items: any[]): number {
  if (node.fn === "count") {
    return node.column === null
      ? items.length
      : items.filter((it) => isPresent(it[node.column as string])).length;
  }
  const vals = numericValues(items, node.column as string);
  if (vals.length === 0) return 0;
  switch (node.fn) {
    case "sum":
      return vals.reduce((a, b) => a + b, 0);
    case "avg":
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    case "min":
      return Math.min(...vals);
    case "max":
      return Math.max(...vals);
  }
}

export function evalCompiled(ast: ExprNode, items: any[]): number {
  switch (ast.kind) {
    case "number":
      return ast.value;
    case "unary":
      return -evalCompiled(ast.operand, items);
    case "binary": {
      const l = evalCompiled(ast.left, items);
      const r = evalCompiled(ast.right, items);
      switch (ast.op) {
        case "+":
          return l + r;
        case "-":
          return l - r;
        case "*":
          return l * r;
        case "/":
          return r === 0 ? 0 : l / r;
      }
      return 0;
    }
    case "agg":
      return evalAgg(ast, items);
  }
}

// --- Validation for the UI ---

export interface ValidationResult {
  ok: boolean;
  error?: string;
  warning?: string;
}

function collectAggs(node: ExprNode, out: Array<Extract<ExprNode, { kind: "agg" }>>) {
  switch (node.kind) {
    case "agg":
      out.push(node);
      break;
    case "unary":
      collectAggs(node.operand, out);
      break;
    case "binary":
      collectAggs(node.left, out);
      collectAggs(node.right, out);
      break;
  }
}

export function validateExpr(expr: string, schema: ColumnSchema[]): ValidationResult {
  const { ast, error } = compileExpr(expr);
  if (!ast) return { ok: false, error };

  const aggs: Array<Extract<ExprNode, { kind: "agg" }>> = [];
  collectAggs(ast, aggs);

  const byKey = new Map(schema.map((c) => [c.key, c]));
  const warnings: string[] = [];

  for (const agg of aggs) {
    if (agg.column === null) continue;
    const col = byKey.get(agg.column);
    if (!col) {
      return { ok: false, error: `Coluna "${agg.column}" não existe.` };
    }
    if (agg.fn !== "count" && col.type !== "number") {
      warnings.push(`"${agg.column}" não é numérica; ${AGG_LABEL[agg.fn]} pode não fazer sentido.`);
    }
  }

  return { ok: true, warning: warnings[0] };
}

// --- Visual-builder helpers (token list <-> expression string) ---

export type BuilderToken =
  | { kind: "agg"; id: string; fn: AggFn; column: string | null }
  | { kind: "number"; id: string; value: string }
  | { kind: "op"; id: string; op: "+" | "-" | "*" | "/" }
  | { kind: "lparen"; id: string }
  | { kind: "rparen"; id: string };

const quoteColumn = (col: string): string =>
  /^[^\s+\-*/(),"]+$/.test(col) ? col : `"${col}"`;

export function aggToString(fn: AggFn, column: string | null): string {
  return `${AGG_LABEL[fn]}(${column ? quoteColumn(column) : ""})`;
}

/** Serializes the visual builder's token list into an expression string. */
export function tokensToExpr(tokens: BuilderToken[]): string {
  return tokens
    .map((t) => {
      switch (t.kind) {
        case "agg":
          return aggToString(t.fn, t.column);
        case "number":
          return t.value;
        case "op":
          return ` ${t.op} `;
        case "lparen":
          return "(";
        case "rparen":
          return ")";
      }
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

let tokenSeq = 0;
const tid = () => `t${Date.now().toString(36)}${(tokenSeq++).toString(36)}`;

const OP_PREC: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };

/**
 * Flattens an AST into a linear builder-token list (infix, with parentheses
 * inserted where operator precedence requires them). Enables round-tripping a
 * saved expression back into the visual builder.
 */
export function astToTokens(ast: ExprNode): BuilderToken[] {
  const out: BuilderToken[] = [];

  const walk = (node: ExprNode, parentPrec: number) => {
    switch (node.kind) {
      case "number":
        out.push({ kind: "number", id: tid(), value: String(node.value) });
        break;
      case "agg":
        out.push({ kind: "agg", id: tid(), fn: node.fn, column: node.column });
        break;
      case "unary":
        out.push({ kind: "number", id: tid(), value: "0" });
        out.push({ kind: "op", id: tid(), op: "-" });
        walk(node.operand, 2);
        break;
      case "binary": {
        const prec = OP_PREC[node.op];
        const needParen = prec < parentPrec;
        if (needParen) out.push({ kind: "lparen", id: tid() });
        walk(node.left, prec);
        out.push({ kind: "op", id: tid(), op: node.op });
        walk(node.right, prec + 1);
        if (needParen) out.push({ kind: "rparen", id: tid() });
        break;
      }
    }
  };

  walk(ast, 0);
  return out;
}

/** Attempts to turn an expression string into builder tokens for editing. */
export function exprToTokens(expr: string): BuilderToken[] | null {
  const { ast } = compileExpr(expr);
  if (!ast) return null;
  return astToTokens(ast);
}

export const makeToken = {
  agg: (fn: AggFn, column: string | null): BuilderToken => ({ kind: "agg", id: tid(), fn, column }),
  number: (value: string): BuilderToken => ({ kind: "number", id: tid(), value }),
  op: (op: "+" | "-" | "*" | "/"): BuilderToken => ({ kind: "op", id: tid(), op }),
  lparen: (): BuilderToken => ({ kind: "lparen", id: tid() }),
  rparen: (): BuilderToken => ({ kind: "rparen", id: tid() }),
};
