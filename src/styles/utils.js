import { rem as polishedRem, stripUnit } from "polished";

import { defaultFontSize } from "styles/sizes";

export const get = (val, defaultValue) => (p) => {
  const result = val.split(".").reduce((acc, key) => acc?.[key], p?.theme);
  return result !== undefined ? result : defaultValue;
};

export const rem = (size) =>
  polishedRem(stripUnit(size), stripUnit(defaultFontSize));
