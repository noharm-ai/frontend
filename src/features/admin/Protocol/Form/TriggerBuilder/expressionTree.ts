import {
  EXPRESSION_TOKEN_REGEX,
  IExpressionToken,
  tokenizeExpression,
} from "src/components/Screening/Patient/Card/ProtocolTrace/expression";

export type TriggerConnector = "and" | "or";

export interface ITriggerVarNode {
  kind: "var";
  name: string;
  negated: boolean;
}

export interface ITriggerGroupNode {
  kind: "group";
  connector: TriggerConnector;
  negated: boolean;
  children: TriggerNode[];
}

export type TriggerNode = ITriggerVarNode | ITriggerGroupNode;

export type ParseResult =
  | { tree: ITriggerGroupNode; error?: undefined }
  | { tree?: undefined; error: string };

export function emptyGroup(
  connector: TriggerConnector = "and"
): ITriggerGroupNode {
  return { kind: "group", connector, negated: false, children: [] };
}

class ParseError extends Error {}

class TokenStream {
  private tokens: IExpressionToken[];
  private pos = 0;

  constructor(tokens: IExpressionToken[]) {
    this.tokens = tokens;
  }

  peek(): IExpressionToken | null {
    return this.tokens[this.pos] ?? null;
  }

  next(): IExpressionToken | null {
    return this.tokens[this.pos++] ?? null;
  }

  done(): boolean {
    return this.pos >= this.tokens.length;
  }
}

// Grammar (Python precedence): or < and < not < atom.
// or   := and ("or" and)*
// and  := not ("and" not)*
// not  := "not"* atom
// atom := {{var}} | "(" or ")"
function parseOr(stream: TokenStream): TriggerNode {
  const terms: TriggerNode[] = [parseAnd(stream)];

  while (stream.peek()?.type === "or") {
    stream.next();
    terms.push(parseAnd(stream));
  }

  if (terms.length === 1) {
    return terms[0];
  }

  return { kind: "group", connector: "or", negated: false, children: terms };
}

function parseAnd(stream: TokenStream): TriggerNode {
  const terms: TriggerNode[] = [parseNot(stream)];

  while (stream.peek()?.type === "and") {
    stream.next();
    terms.push(parseNot(stream));
  }

  if (terms.length === 1) {
    return terms[0];
  }

  return { kind: "group", connector: "and", negated: false, children: terms };
}

function parseNot(stream: TokenStream): TriggerNode {
  let negate = false;

  while (stream.peek()?.type === "not") {
    stream.next();
    negate = !negate;
  }

  const atom = parseAtom(stream);

  if (negate) {
    return { ...atom, negated: !atom.negated };
  }

  return atom;
}

function parseAtom(stream: TokenStream): TriggerNode {
  const token = stream.next();

  if (!token) {
    throw new ParseError("expressão termina de forma inesperada");
  }

  if (token.type === "var") {
    const match = token.raw.match(/^\{\{([^}]+)\}\}$/);
    if (!match) {
      throw new ParseError(`variável inválida: ${token.raw}`);
    }

    return { kind: "var", name: match[1].trim(), negated: false };
  }

  if (token.type === "open") {
    const inner = parseOr(stream);
    const close = stream.next();

    if (!close || close.type !== "close") {
      throw new ParseError("parênteses não balanceados");
    }

    return inner;
  }

  throw new ParseError(`token inesperado: "${token.raw}"`);
}

export function parseTriggerExpression(expression: string): ParseResult {
  const source = expression ?? "";

  const leftover = source.replace(EXPRESSION_TOKEN_REGEX, "").trim();
  if (leftover !== "") {
    return { error: `texto não reconhecido: "${leftover.slice(0, 30)}"` };
  }

  const tokens = tokenizeExpression(source);

  if (tokens.length === 0) {
    return { tree: emptyGroup() };
  }

  const stream = new TokenStream(tokens);

  try {
    const node = parseOr(stream);

    if (!stream.done()) {
      const extra = stream.peek();
      throw new ParseError(`token inesperado: "${extra?.raw}"`);
    }

    if (node.kind === "group") {
      return { tree: node };
    }

    return { tree: { ...emptyGroup(), children: [node] } };
  } catch (e) {
    if (e instanceof ParseError) {
      return { error: e.message };
    }
    throw e;
  }
}

function serializeNode(node: TriggerNode, isRoot: boolean): string {
  if (node.kind === "var") {
    if (!node.name) {
      return "";
    }

    const ref = `{{${node.name}}}`;
    return node.negated ? `not ${ref}` : ref;
  }

  const parts = node.children
    .map((child) => serializeNode(child, false))
    .filter((part) => part !== "");

  if (parts.length === 0) {
    return "";
  }

  const joined = parts.join(` ${node.connector} `);

  if (node.negated) {
    return `not (${joined})`;
  }

  if (isRoot || parts.length === 1) {
    return joined;
  }

  return `(${joined})`;
}

export function serializeTriggerExpression(root: ITriggerGroupNode): string {
  return serializeNode(root, true);
}

function updateChildren(
  group: ITriggerGroupNode,
  index: number,
  child: TriggerNode | null
): ITriggerGroupNode {
  const children =
    child === null
      ? group.children.filter((_, i) => i !== index)
      : group.children.map((c, i) => (i === index ? child : c));

  return { ...group, children };
}

export function updateNodeAtPath(
  root: ITriggerGroupNode,
  path: number[],
  updater: (node: TriggerNode) => TriggerNode
): ITriggerGroupNode {
  if (path.length === 0) {
    return updater(root) as ITriggerGroupNode;
  }

  const [index, ...rest] = path;
  const child = root.children[index];

  if (!child) {
    return root;
  }

  if (rest.length === 0) {
    return updateChildren(root, index, updater(child));
  }

  if (child.kind !== "group") {
    return root;
  }

  return updateChildren(root, index, updateNodeAtPath(child, rest, updater));
}

export function removeNodeAtPath(
  root: ITriggerGroupNode,
  path: number[]
): ITriggerGroupNode {
  if (path.length === 0) {
    return root;
  }

  if (path.length === 1) {
    return updateChildren(root, path[0], null);
  }

  const [index, ...rest] = path;
  const child = root.children[index];

  if (!child || child.kind !== "group") {
    return root;
  }

  return updateChildren(root, index, removeNodeAtPath(child, rest));
}

export function appendChildAtPath(
  root: ITriggerGroupNode,
  path: number[],
  node: TriggerNode
): ITriggerGroupNode {
  return updateNodeAtPath(root, path, (target) => {
    if (target.kind !== "group") {
      return target;
    }

    return { ...target, children: [...target.children, node] };
  });
}

export function collectVariableNames(node: TriggerNode): string[] {
  if (node.kind === "var") {
    return node.name ? [node.name] : [];
  }

  return node.children.flatMap(collectVariableNames);
}

export function isEmptyTree(root: ITriggerGroupNode): boolean {
  return serializeTriggerExpression(root) === "";
}
