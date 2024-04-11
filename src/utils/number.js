import Big from "big.js";
import toFormat from "toformat";

export function formatCurrency(value, precision = 2) {
  if (!value) {
    return "-";
  }
  const locale = localStorage.getItem("language") === "en" ? "en-US" : "pt-BR";

  if (value instanceof Big) {
    toFormat(Big);
    if (locale === "pt-BR") {
      return value.toFormat(2, {
        decimalSeparator: ",",
        groupSeparator: ".",
        groupSize: 3,
      });
    }

    return value.toFormat(2, {
      decimalSeparator: ".",
      groupSeparator: ",",
      groupSize: 3,
    });
  }

  if (typeof value === "string" || value instanceof String) {
    return parseFloat(value).toLocaleString(locale, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
  }

  return value.toLocaleString(locale, {
    minimumFractionDigits: precision,
  });
}
