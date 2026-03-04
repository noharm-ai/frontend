export interface ChartConfig {
  id: string;
  type: "bar" | "line" | "pie";
  xKeys: string[];
  yKeys: string[];
  title: string;
  width: "full" | "half";
}

export interface ChartCreatorProps {
  data: any[];
  initialCharts?: ChartConfig[];
  onChartsChange?: (charts: ChartConfig[]) => void;
  readOnly?: boolean;
}
