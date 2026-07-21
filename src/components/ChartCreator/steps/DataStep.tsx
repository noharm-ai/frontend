import { Alert, Flex, Input, Segmented, Select, Switch } from "antd";
import { labelStyle, hintStyle } from "./fieldStyles";
import type { DateGrouping } from "../types";
import type { WizardStepProps } from "./StepProps";

export function DataStep({ draft, patchDraft, keys }: WizardStepProps) {
  // The gauge shows a single scalar, so there are no X categories to pick.
  const needsAxis = draft.type !== "gauge";

  return (
    <Flex vertical gap="middle">
      <div>
        <label style={labelStyle}>Título do gráfico</label>
        <Input
          placeholder="Ex.: Atendimentos por setor"
          value={draft.title}
          onChange={(e) => patchDraft({ title: e.target.value })}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
          <Switch
            checked={draft.showTitle !== false}
            onChange={(v) => patchDraft({ showTitle: v })}
            size="small"
          />
          <span
            style={{ cursor: "pointer", fontSize: 12, color: "#888" }}
            onClick={() => patchDraft({ showTitle: draft.showTitle === false })}
          >
            Exibir o título dentro do gráfico
          </span>
        </div>
      </div>

      {needsAxis ? (
        <>
          <div>
            <label style={labelStyle}>Agrupar por (eixo X)</label>
            <Select
              mode="multiple"
              placeholder="Selecione a(s) coluna(s) que formam as categorias"
              style={{ width: "100%" }}
              value={draft.xKeys}
              onChange={(val) => patchDraft({ xKeys: val })}
              options={keys.map((k) => ({ label: k, value: k }))}
              maxTagCount="responsive"
            />
            <div style={hintStyle}>
              Cada valor distinto vira uma coluna/fatia do gráfico. Ex.: setor, mês, profissional.
            </div>
          </div>

          <div>
            <label style={labelStyle}>Agrupamento de data</label>
            <Segmented
              block
              value={draft.dateGrouping ?? "none"}
              onChange={(val) => patchDraft({ dateGrouping: val as DateGrouping })}
              options={[
                { label: "Nenhum", value: "none" },
                { label: "Dia", value: "day" },
                { label: "Semana", value: "week" },
                { label: "Mês", value: "month" },
                { label: "Trimestre", value: "quarter" },
                { label: "Ano", value: "year" },
              ]}
            />
            <div style={hintStyle}>
              Use quando o eixo X for uma data e você quiser agrupar por período.
            </div>
          </div>
        </>
      ) : (
        <Alert
          type="info"
          showIcon
          message="O medidor mostra um único valor, calculado sobre todos os dados filtrados. Defina a métrica no próximo passo."
        />
      )}
    </Flex>
  );
}
