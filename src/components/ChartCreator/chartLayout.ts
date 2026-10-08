import { ChartConfig } from "./types";

export type ChartWidth = ChartConfig["width"];

/** Horizontal and vertical space between charts, in px. */
export const CHART_GUTTER = 16;

/** Grid columns (out of 24) each width takes. */
export const WIDTH_SPAN: Record<ChartWidth, number> = {
  third: 8,
  half: 12,
  full: 24,
};

export const WIDTH_LABEL: Record<ChartWidth, string> = {
  third: "Um terço",
  half: "Metade",
  full: "Tela inteira",
};

/** Height range shared by the editor and by resizing from the corner. */
export const CHART_HEIGHT = { min: 200, max: 1200, step: 50, initial: 400 };

/** The width whose share of the row is closest to `fraction`. */
export const snapWidth = (fraction: number): ChartWidth =>
  (Object.keys(WIDTH_SPAN) as ChartWidth[]).reduce((best, width) =>
    Math.abs(WIDTH_SPAN[width] / 24 - fraction) <
    Math.abs(WIDTH_SPAN[best] / 24 - fraction)
      ? width
      : best,
  );

/** Rounds to the editor's height step, within its range. */
export const snapHeight = (px: number): number =>
  Math.min(
    CHART_HEIGHT.max,
    Math.max(
      CHART_HEIGHT.min,
      Math.round(px / CHART_HEIGHT.step) * CHART_HEIGHT.step,
    ),
  );

/** Which side of the target chart a dragged chart lands on. */
export type DropSide = "before" | "after";

/** dataTransfer type carrying the dragged chart id; foreign drags lack it. */
export const CHART_DRAG_TYPE = "application/x-chart-id";

/** Swaps a chart with its neighbour; out-of-range moves return `charts`. */
export const moveChartBy = (
  charts: ChartConfig[],
  id: string,
  offset: -1 | 1,
): ChartConfig[] => {
  const from = charts.findIndex((chart) => chart.id === id);
  const to = from + offset;
  if (from < 0 || to < 0 || to >= charts.length) return charts;

  const next = [...charts];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
};

/** Moves a chart next to another one; unknown ids return `charts`. */
export const moveChartTo = (
  charts: ChartConfig[],
  id: string,
  targetId: string,
  side: DropSide,
): ChartConfig[] => {
  const moved = charts.find((chart) => chart.id === id);
  if (!moved || id === targetId) return charts;

  const rest = charts.filter((chart) => chart.id !== id);
  const targetIndex = rest.findIndex((chart) => chart.id === targetId);
  if (targetIndex < 0) return charts;

  rest.splice(side === "before" ? targetIndex : targetIndex + 1, 0, moved);
  return rest;
};
