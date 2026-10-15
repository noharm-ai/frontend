// A CONTAINS value is a plain string that may join several texts: "&" requires
// all of them and "|" accepts any of them ("&" binds tighter, no parentheses).
// Mirrors utils/contains_expression.py in the backend.

export const CONTAINS_EXPRESSION_HINT =
  "Use & para exigir todos os textos e | para aceitar qualquer um. Ex.: ml/min & gotejo";

export const isContainsExpression = (value: any): boolean =>
  typeof value === "string" && (value.includes("&") || value.includes("|"));

/**
 * Splits a CONTAINS value into OR groups of AND terms, dropping blank terms.
 */
export const parseContainsExpression = (value: any): string[][] => {
  if (!isContainsExpression(value)) return [[String(value)]];

  const groups = String(value)
    .split("|")
    .map((group) =>
      group
        .split("&")
        .map((term) => term.trim())
        .filter(Boolean),
    )
    .filter((group) => group.length > 0);

  return groups.length ? groups : [[String(value)]];
};

/**
 * Readable form of a CONTAINS value, e.g. "ml/min" e "gotejo" ou "bic".
 */
export const describeContainsExpression = (value: any): string =>
  parseContainsExpression(value)
    .map((group) => group.map((term) => `"${term}"`).join(" e "))
    .join(" ou ");
