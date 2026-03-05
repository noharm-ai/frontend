export type AggregationType = "none" | "count" | "sum" | "avg" | "min" | "max";
export type SortOrder = "none" | "asc" | "desc";
export type DateGrouping = "none" | "day" | "week" | "month" | "quarter" | "year";

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
  dateGrouping?: DateGrouping;
  derivedColumns?: DerivedColumn[];
}

export interface ChartCreatorProps {
  data: any[];
  initialCharts?: ChartConfig[];
  onChartsChange?: (charts: ChartConfig[]) => void;
  readOnly?: boolean;
}
