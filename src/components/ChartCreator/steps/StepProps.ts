import type { ChartConfig, ColumnSchema } from "../types";

export interface WizardStepProps {
  draft: ChartConfig;
  patchDraft: (patch: Partial<ChartConfig>) => void;
  keys: string[];
  schema: ColumnSchema[];
  /** Unfiltered rows feeding the chart — used to list real categories/values. */
  data: any[];
}
