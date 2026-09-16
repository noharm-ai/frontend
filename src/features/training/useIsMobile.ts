import { useSyncExternalStore } from "react";

import { breakpointsEnum } from "styles/breakpoints";

// same threshold the app shell uses to collapse the side menu (Sider
// breakpoint="lg"), so the training pages switch layout together with it
const MOBILE_QUERY = `(max-width: ${breakpointsEnum.lg - 1}px)`;

const subscribe = (onChange: () => void) => {
  const mediaQuery = window.matchMedia(MOBILE_QUERY);
  mediaQuery.addEventListener("change", onChange);

  return () => mediaQuery.removeEventListener("change", onChange);
};

const getSnapshot = () => window.matchMedia(MOBILE_QUERY).matches;

const getServerSnapshot = () => false;

/**
 * True below the `lg` breakpoint. Read synchronously on the first render, so
 * there is no desktop-to-mobile flash on load.
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
