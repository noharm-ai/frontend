import { rem as polishedRem, stripUnit } from "polished";

import { defaultFontSize } from "styles/sizes";

type ThemeProps = { theme?: object };

export const get =
  <T = string>(val: string, defaultValue?: T) =>
  (p?: ThemeProps): T => {
    const result = val
      .split(".")
      .reduce<unknown>(
        (acc, key) => (acc as Record<string, unknown> | undefined)?.[key],
        p?.theme,
      );
    return (result !== undefined ? result : defaultValue) as T;
  };

export const rem = (size: string | number) =>
  polishedRem(stripUnit(size), stripUnit(defaultFontSize));
