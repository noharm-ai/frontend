import theme from "./theme";

// High contrast palette (user preference). Every text color reaches at least
// 4.5:1 against white (WCAG AA), and stays readable as a background behind
// white text; borders reach at least 3:1.
const highContrastColors = {
  text: "#1f1f1f",
  textSecondary: "#1f1f1f",
  fourth: "#3d3d3d",
  fifth: "#767676",
  detail: "#767676",
  accent: "#2d6a4a",
  accentSecondary: "#1d5f66",
  danger: "#b3261e",
};

export const highContrastTheme = {
  ...theme,
  colors: { ...theme.colors, ...highContrastColors },
  highContrast: true,
};

export const highContrastTokens = {
  colorPrimary: "#0047a3",
  colorLink: "#0047a3",
  colorInfo: "#0047a3",
  colorSuccess: "#237804",
  colorWarning: "#ad4e00",
  colorError: "#a8071a",
  colorText: "#1f1f1f",
  colorTextHeading: "#000",
  colorTextSecondary: "#3d3d3d",
  colorTextTertiary: "#4a4a4a",
  colorTextQuaternary: "#595959",
  colorTextDescription: "#4a4a4a",
  colorTextPlaceholder: "#595959",
  colorTextDisabled: "#595959",
  colorIcon: "#3d3d3d",
  colorIconHover: "#000",
  colorBorder: "#767676",
  colorBorderSecondary: "#8c8c8c",
  colorSplit: "#8c8c8c",
  lineWidthFocus: 3,
  controlOutlineWidth: 3,
};
