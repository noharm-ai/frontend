import { breakpointsEnum } from "styles/breakpoints";

export const getResponsiveTableWidth = (
  scrollWidth: string
): { x: string } | null => {
  const width = window.innerWidth;

  if (width > breakpointsEnum.lg) {
    return null;
  }

  if (width < breakpointsEnum.md) {
    return { x: scrollWidth };
  }

  return { x: `${width + width * 0.2}px` };
};
