import { ReactNode, useEffect, useRef, useState } from "react";

import { TabBar } from "../InfectionControlConsolidatedReport.style";

interface StickyTabBarProps {
  // the page title, shown on the bar while it is stuck
  title: string;
  // antd's tab bar
  children: ReactNode;
}

/**
 * The report's tab bar, stuck to the top of the page on scroll. It keeps
 * whether it is stuck to itself, so sticking redraws the bar, not the page
 * and its charts.
 */
export function StickyTabBar({ title, children }: StickyTabBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  // stuck at 1px above the page, the bar is no longer whole in view
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const observer = new IntersectionObserver(
      ([entry]) =>
        setStuck(
          entry.intersectionRatio < 1 && entry.boundingClientRect.top < 0,
        ),
      { threshold: [1] },
    );
    observer.observe(bar);

    return () => observer.disconnect();
  }, []);

  return (
    <TabBar ref={barRef} className={stuck ? "stuck" : ""}>
      <span className="tab-bar-title">{title}</span>
      {children}
    </TabBar>
  );
}
