import Big from "big.js";
import toFormat from "toformat";

export function formatCurrency(value, precision = 2) {
  if (value === null || value === undefined) {
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
    maximumFractionDigits: precision,
  });
}

export function formatNumber(value, precision = 2) {
  return formatCurrency(value, precision);
}

export function isNumber(value) {
  try {
    Big(value);

    return true;
  } catch {
    return false;
  }
}

export function isInt(value) {
  return (
    !isNaN(value) &&
    parseInt(Number(value)) == value &&
    !isNaN(parseInt(value, 10)) &&
    `${value}`.indexOf(".") === -1
  );
}

export function formatCpf(number) {
  if (!number) {
    return "-";
  }

  return `${number}`.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
