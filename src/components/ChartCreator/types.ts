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

export interface DerivedColumnOperand {
  type: "column" | "number";
  columnKey?: string;
  number?: number;
}

export interface DerivedColumn {
  name: string;
  left: DerivedColumnOperand;
  operator: "+" | "-" | "*" | "/";
  right: DerivedColumnOperand;
}

export interface ReferenceLine {
  value: number;
  label?: string;
}

export interface ChartConfig {
  id: string;
  type: "bar" | "hbar" | "line" | "pie";
  xKeys: string[];
  yKeys: string[];
  title: string;
  width: "full" | "half";
  aggregation?: AggregationType;
  sortOrder?: SortOrder;
  topN?: number;
  showLabels?: boolean;
  height?: number;
  dateGrouping?: DateGrouping;
  derivedColumns?: DerivedColumn[];
  referenceLine?: ReferenceLine;
  showTitle?: boolean;
  colorPalette?: ColorPalette;
}

export interface ChartCreatorProps {
  data: any[];
  initialCharts?: ChartConfig[];
  onChartsChange?: (charts: ChartConfig[]) => void;
  readOnly?: boolean;
}
