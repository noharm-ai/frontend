import type { ChartConfig, ColorPalette, ColorScope } from "./types";

/**
 * ECharts 6 default series colors (`tokens.color.theme`). Mirrored here so the
 * wizard can preview and offer the automatic colors as picker defaults — the
 * chart itself still lets ECharts apply them when no palette is chosen.
 */
export const ECHARTS_DEFAULT_COLORS = [
  "#5070dd",
  "#b6d634",
  "#505372",
  "#ff994d",
  "#0ca8df",
  "#ffd10a",
  "#fb628b",
  "#785db0",
  "#3fbe95",
];

/**
 * Automatic palettes. `default` is empty on purpose: it means "let ECharts use
 * its own theme colors" so nothing is written into the chart option.
 */
export const PALETTE_OPTIONS: {
  label: string;
  value: ColorPalette;
  colors: string[];
}[] = [
  { label: "Padrão", value: "default", colors: [] },
  {
    label: "Secundário",
    value: "secondary",
    colors: ["#2e3c5a", "#7ebe9a", "#70bdc3", "#e46666", "#f2b530", "#696766"],
  },
  {
    label: "Azuis",
    value: "blues",
    colors: ["#1a237e", "#1565c0", "#1976d2", "#42a5f5", "#90caf9", "#bbdefb"],
  },
  {
    label: "Verdes",
    value: "greens",
    colors: ["#1b5e20", "#388e3c", "#66bb6a", "#a5d6a7", "#c8e6c9", "#43a047"],
  },
  {
    label: "Quente",
    value: "warm",
    colors: ["#bf360c", "#e64a19", "#ff7043", "#ffa726", "#ffca28", "#ffee58"],
  },
  {
    label: "Pastel",
    value: "pastel",
    colors: ["#b39ddb", "#90caf9", "#80cbc4", "#a5d6a7", "#ffcc80", "#f48fb1"],
  },
  {
    label: "Contraste",
    value: "contrast",
    colors: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"],
  },
];

export const COLOR_PALETTES: Record<ColorPalette, string[]> = PALETTE_OPTIONS.reduce(
  (acc, { value, colors }) => {
    acc[value] = colors;
    return acc;
  },
  {} as Record<ColorPalette, string[]>,
);

export function getPaletteColors(palette: ColorPalette | undefined): string[] {
  return COLOR_PALETTES[palette ?? "default"] ?? [];
}

/**
 * Color ECharts would pick for the nth item of a chart using `palette`. Used as
 * the starting value of each manual color picker, so turning manual colors on
 * never changes how the chart looks until the user actually picks something.
 */
export function autoColorAt(palette: ColorPalette | undefined, index: number): string {
  const colors = getPaletteColors(palette);
  const list = colors.length ? colors : ECHARTS_DEFAULT_COLORS;
  return list[index % list.length];
}

/**
 * Whether manual colors are assigned per value series (one color per metric) or
 * per category (one color per bar/slice). Single-metric bar charts draw one bar
 * per category, so those are colored by category — that is the "one bar green,
 * one bar red" case. Lines are always colored per series: a line with a color
 * per point would be unreadable.
 */
export function getColorScope(config: ChartConfig, seriesCount: number): ColorScope {
  if (config.type === "pie" || config.type === "funnel") return "category";
  if (config.type === "gauge" || config.type === "radar" || config.type === "line") {
    return "series";
  }
  return seriesCount > 1 ? "series" : "category";
}

/** Returns the manual color map that applies to `config`, or null when off. */
export function getCustomColors(
  config: ChartConfig,
  scope: ColorScope,
): Record<string, string> | null {
  if (config.colorMode !== "custom") return null;
  const map = scope === "series" ? config.seriesColors : config.categoryColors;
  return map && Object.keys(map).length ? map : null;
}
