import type { ChartConfig, ColumnSchema } from "../types";

export interface WizardStepProps {
  draft: ChartConfig;
  patchDraft: (patch: Partial<ChartConfig>) => void;
  keys: string[];
  schema: ColumnSchema[];
}
