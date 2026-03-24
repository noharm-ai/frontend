// Returns { value: Number, error: String|null }
//
// Safe recursive descent parser for arithmetic expressions.
// Grammar (EBNF):
//   expr   = term   { ('+' | '-') term   }
//   term   = factor { ('*' | '/') factor }
//   factor = '-' factor | '(' expr ')' | NUMBER
//
// No eval / new Function used anywhere.

export function evaluateFormula(formula, values) {
  const substituted = formula.replace(/\{\{([^}]+)\}\}/g, (_, id) => {
    const num = parseFloat(values[id]);
    return isNaN(num) ? "0" : String(num);
  });

  try {
    const result = parseExpression(substituted.trim());
    if (typeof result !== "number" || !isFinite(result)) throw new Error();
    return { value: result, error: null };
  } catch {
    return { value: null, error: "Fórmula inválida" };
  }
}

function tokenise(input) {
  const tokens = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (" \t\n".includes(ch)) { i++; continue; }
    if ("+-*/()".includes(ch)) { tokens.push({ type: ch, value: ch }); i++; continue; }
    const numMatch = /^[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?/.exec(input.slice(i));
    if (numMatch) {
      tokens.push({ type: "NUM", value: parseFloat(numMatch[0]) });
      i += numMatch[0].length;
      continue;
    }
    throw new Error(`Unexpected character: ${ch}`);
  }
  tokens.push({ type: "EOF" });
  return tokens;
}

function parseExpression(input) {
  const tokens = tokenise(input);
  let pos = 0;

  const peek = () => tokens[pos];
  const consume = (type) => {
    const tok = tokens[pos];
    if (type && tok.type !== type) throw new Error(`Expected ${type}`);
    pos++;
    return tok;
  };

  function parseExpr() {
    let left = parseTerm();
    while (peek().type === "+" || peek().type === "-") {
      const op = consume().type;
      const right = parseTerm();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  function parseTerm() {
    let left = parseFactor();
    while (peek().type === "*" || peek().type === "/") {
      const op = consume().type;
      const right = parseFactor();
      if (op === "/") {
        if (right === 0) throw new Error("Division by zero");
        left = left / right;
      } else {
        left = left * right;
      }
    }
    return left;
  }

  function parseFactor() {
    const tok = peek();
    if (tok.type === "-") { consume("-"); return -parseFactor(); }
    if (tok.type === "(") { consume("("); const val = parseExpr(); consume(")"); return val; }
    if (tok.type === "NUM") { consume("NUM"); return tok.value; }
    throw new Error(`Unexpected token: ${tok.type}`);
  }

  const result = parseExpr();
  if (peek().type !== "EOF") throw new Error("Unexpected trailing tokens");
  return result;
}
