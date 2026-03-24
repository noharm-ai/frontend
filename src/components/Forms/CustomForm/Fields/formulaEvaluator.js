// Returns { value: Number, error: String|null }
export function evaluateFormula(formula, values) {
  try {
    const expr = formula.replace(/\{\{([^}]+)\}\}/g, (_, id) => {
      const num = parseFloat(values[id]);
      return isNaN(num) ? 0 : num;
    });
    // eslint-disable-next-line no-new-func
    const result = new Function(`return (${expr})`)();
    if (typeof result !== "number" || !isFinite(result)) throw new Error();
    return { value: result, error: null };
  } catch {
    return { value: null, error: "Fórmula inválida" };
  }
}
