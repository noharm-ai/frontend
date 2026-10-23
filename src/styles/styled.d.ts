import "styled-components";

import type theme from "./theme";

type AppTheme = typeof theme & {
  // set by the high contrast preference (styles/highContrast.ts)
  highContrast?: boolean;
};

declare module "styled-components" {
  // augmenting DefaultTheme takes an interface, even an empty one
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends AppTheme {}
}
