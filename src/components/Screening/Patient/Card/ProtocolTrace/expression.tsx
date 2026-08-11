import Tooltip from "components/Tooltip";

import { ExpressionLineRow, ExpressionToken } from "./ProtocolTrace.style";
import { variableTone } from "./formatters";
import type { IVariableTrace } from "./types";

export type ExpressionTokenType =
  | "open"
  | "close"
  | "and"
  | "or"
  | "not"
  | "var";

export interface IExpressionToken {
  type: ExpressionTokenType;
  raw: string;
}

interface IExpressionLine {
  depth: number;
  tokens: IExpressionToken[];
}

const INDENT_PX = 18;

export const EXPRESSION_TOKEN_REGEX =
  /\{\{[^}]+\}\}|\(|\)|\band\b|\bor\b|\bnot\b/g;

export function tokenizeExpression(expression: string): IExpressionToken[] {
  const matches = expression.match(EXPRESSION_TOKEN_REGEX) || [];

  return matches.map((raw) => {
    if (raw === "(") return { type: "open" as const, raw };
    if (raw === ")") return { type: "close" as const, raw };
    if (raw === "and") return { type: "and" as const, raw };
    if (raw === "or") return { type: "or" as const, raw };
    if (raw === "not") return { type: "not" as const, raw };
    return { type: "var" as const, raw };
  });
}

// Groups tokens into indented lines: parens and and/or connectors always
// start a fresh line (at the paren-nesting depth) so long expressions read
// top-to-bottom instead of wrapping mid-clause; "not" glues to its operand.
function layoutExpression(tokens: IExpressionToken[]): IExpressionLine[] {
  const lines: IExpressionLine[] = [];
  let depth = 0;
  let current: IExpressionLine = { depth, tokens: [] };

  const breakLine = () => {
    if (current.tokens.length > 0) {
      lines.push(current);
    }
    current = { depth, tokens: [] };
  };

  tokens.forEach((token) => {
    switch (token.type) {
      case "open":
        breakLine();
        current.tokens.push(token);
        depth += 1;
        breakLine();
        break;
      case "close":
        depth -= 1;
        breakLine();
        current.tokens.push(token);
        break;
      case "and":
      case "or":
        breakLine();
        current.tokens.push(token);
        break;
      default:
        current.tokens.push(token);
    }
  });
  breakLine();

  return lines;
}

function renderExpressionToken(
  token: IExpressionToken,
  index: number,
  byName: Map<string, IVariableTrace>,
  onSelect: (name: string) => void
) {
  if (token.type !== "var") {
    return (
      <ExpressionToken key={index} $variant="muted">
        {token.raw}
      </ExpressionToken>
    );
  }

  const match = token.raw.match(/^\{\{([^}]+)\}\}$/);
  const variable = match ? byName.get(match[1]) : undefined;

  if (!variable) {
    return (
      <ExpressionToken key={index} $variant="muted">
        {token.raw}
      </ExpressionToken>
    );
  }

  const variant = variableTone(variable);

  return (
    <Tooltip key={index} title={variable.message} underline>
      <ExpressionToken
        $variant={variant}
        $interactive
        onClick={() => onSelect(variable.name)}
      >
        {token.raw}
      </ExpressionToken>
    </Tooltip>
  );
}

export function renderExpression(
  expression: string,
  variables: IVariableTrace[],
  onSelect: (name: string) => void
) {
  const byName = new Map(variables.map((v) => [v.name, v]));
  const lines = layoutExpression(tokenizeExpression(expression));

  return lines.map((line, lineIndex) => (
    <ExpressionLineRow
      key={lineIndex}
      style={{ paddingLeft: line.depth * INDENT_PX }}
    >
      {line.tokens.map((token, tokenIndex) =>
        renderExpressionToken(token, tokenIndex, byName, onSelect)
      )}
    </ExpressionLineRow>
  ));
}
