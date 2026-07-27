import { Flex } from "antd";
import { ChartFilterPanel } from "../ChartFilterPanel";
import { hintStyle } from "./fieldStyles";
import type { WizardStepProps } from "./StepProps";

export function FiltersStep({ draft, patchDraft, schema }: WizardStepProps) {
  return (
    <Flex vertical gap="small">
      <span style={hintStyle}>
        Filtros restringem os dados usados apenas neste gráfico (opcional).
      </span>
      <ChartFilterPanel
        filters={draft.filters ?? []}
        schema={schema}
        readOnly={false}
        onChange={(filters) => patchDraft({ filters })}
      />
    </Flex>
  );
}
