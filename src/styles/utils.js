import getter from "lodash.get";
import { rem as polishedRem, stripUnit } from "polished";

import { defaultFontSize } from "styles/sizes";

export const get = (val, defaultValue) => (p) =>
  getter(p, `theme.${val}`, defaultValue);

export const rem = (size) =>
  polishedRem(stripUnit(size), stripUnit(defaultFontSize));
