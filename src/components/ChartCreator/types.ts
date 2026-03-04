export type AggregationType = "none" | "count" | "sum" | "avg" | "min" | "max";
export type SortOrder = "none" | "asc" | "desc";

export interface ChartConfig {
  id: string;
  type: "bar" | "line" | "pie";
  xKeys: string[];
  yKeys: string[];
  title: string;
  width: "full" | "half";
  aggregation?: AggregationType;
  sortOrder?: SortOrder;
  topN?: number;
  showLabels?: boolean;
  height?: number;
}

export interface ChartCreatorProps {
  data: any[];
  initialCharts?: ChartConfig[];
  onChartsChange?: (charts: ChartConfig[]) => void;
  readOnly?: boolean;
}
