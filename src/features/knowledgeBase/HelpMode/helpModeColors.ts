/**
 * The help mode's own colors: a lavender used nowhere else on the main
 * screens, so the bar and the highlights never blend into the app.
 */
export const helpModeColors = {
  // the bar, and the active header toggle
  base: "#a991d6",
  // highlight borders and badges: deeper, to stand out against white cards
  strong: "#8a6cc7",
  // text on `base`
  text: "#ffffff",
};

// `base` as rgba, for the translucent fills
export const helpModeTint = (alpha: number) => `rgba(169, 145, 214, ${alpha})`;
