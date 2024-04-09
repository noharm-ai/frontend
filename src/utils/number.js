import Big from "big.js";
import toFormat from "toformat";

export function formatCurrency(value, precision = 2) {
  if (!value) {
    return "-";
  }

  if (value instanceof Big) {
    toFormat(Big);
    return value.toFormat(2, {
      decimalSeparator: ",",
      groupSeparator: ".",
      groupSize: 3,
    });
  }

  return value.toLocaleString();
}
