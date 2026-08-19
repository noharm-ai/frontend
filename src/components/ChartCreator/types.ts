import type { ReactNode, Ref } from "react";
import type { Filter } from "src/utils/dataFilters";
export type { Filter, ColumnSchema } from "src/utils/dataFilters";

export type AggregationType = "none" | "count" | "count_pct" | "sum" | "avg" | "min" | "max";
export type SortOrder = "none" | "asc" | "desc";
export type DateGrouping =
  | "none"
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year";
export type ColorPalette =
  | "default"
  | "secondary"
  | "blues"
  | "greens"
  | "warm"
  | "pastel"
  | "contrast";

/** "palette" = automatic colors; "custom" = colors picked by the user. */
export type ColorMode = "palette" | "custom";

/** What a manual color is attached to. See `getColorScope`. */
export type ColorScope = "series" | "category";

export interface ReferenceLine {
  value: number;
  label?: string;
}

/**
 * A value series defined by an aggregation expression, e.g. "contagem()",
 * "soma(dose)" or "contagem(a) / contagem(b) * 100". When `series` is present
 * on a ChartConfig it takes precedence over the legacy `yKeys`/`aggregation`
 * path. Kept optional so charts saved before this field remain valid.
 */
export interface ChartSeries {
  id: string;
  label?: string;
  expr: string;
}

export interface ChartConfig {
  id: string;
  type: "bar" | "hbar" | "line" | "pie" | "funnel" | "gauge" | "radar";
  xKeys: string[];
  yKeys: string[];
  title: string;
  /** Layout width. "third" added later; older charts only use full/half. */
  width: "full" | "half" | "third";
  aggregation?: AggregationType;
  sortOrder?: SortOrder;
  xSortOrder?: SortOrder;
  xLabelRotate?: number;
  topN?: number;
  showLabels?: boolean;
  height?: number;
  dateGrouping?: DateGrouping;
  referenceLine?: ReferenceLine;
  showTitle?: boolean;
  colorPalette?: ColorPalette;
  /** Defaults to "palette" (automatic) when unset, as on charts saved before this field. */
  colorMode?: ColorMode;
  /**
   * Manual color per value series, keyed by series key (column name, series id
   * or "__count__"). Only applied when `colorMode` is "custom" and the chart is
   * colored per series. Series left out keep the automatic color.
   */
  seriesColors?: Record<string, string>;
  /**
   * Manual color per X category (bar/slice), keyed by the category label.
   * Only applied when `colorMode` is "custom" and the chart is colored per
   * category. Categories left out keep the automatic color.
   */
  categoryColors?: Record<string, string>;
  stacked?: boolean;
  /** Upper bound of the gauge dial; auto-computed from the value when unset. */
  gaugeMax?: number;
  filters?: Filter[];
  /** Expression-based value series. When set, overrides yKeys/aggregation. */
  series?: ChartSeries[];
}

export interface ChartCreatorHandle {
  appendCharts: (charts: ChartConfig[]) => void;
}

export interface ChartCreatorProps {
  data: any[];
  initialCharts?: ChartConfig[];
  onChartsChange?: (charts: ChartConfig[]) => void;
  readOnly?: boolean;
  extraActions?: ReactNode;
  /**
   * Generates chart suggestions from a natural-language hint (LLM backend).
   * When provided, the wizard exposes a "Gerar com agente" step that loads the
   * first suggestion into the editable draft.
   */
  onGenerateCharts?: (hint: string) => Promise<ChartConfig[]>;
  ref?: Ref<ChartCreatorHandle>;
}
