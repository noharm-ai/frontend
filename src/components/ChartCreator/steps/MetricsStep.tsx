import { useState } from "react";
import { Alert, Button, Flex, Input, Modal, Segmented, Select, Space } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { labelStyle, hintStyle } from "./fieldStyles";
import { FormulaBuilder } from "./FormulaBuilder";
import { aggToString, type AggFn } from "../expression/exprEngine";
import type { AggregationType, ChartSeries } from "../types";
import type { WizardStepProps } from "./StepProps";

const genId = () => Math.random().toString(36).slice(2, 11);

type Mode = "simple" | "formula";

// Maps a legacy aggregation to the equivalent expression function (for the
// Simple → Formula pre-fill). count_pct has no per-group equivalent.
const AGG_TO_FN: Partial<Record<AggregationType, AggFn>> = {
  count: "count",
  sum: "sum",
  avg: "avg",
  min: "min",
  max: "max",
};

export function MetricsStep({ draft, patchDraft, keys, schema }: WizardStepProps) {
  const isFormula = !!draft.series && draft.series.length > 0;
  const [mode, setMode] = useState<Mode>(isFormula ? "formula" : "simple");

  // Pie, funnel and gauge all plot a single value (only the first metric).
  const isSingleValue =
    draft.type === "pie" || draft.type === "funnel" || draft.type === "gauge";
  const aggregation = draft.aggregation ?? "none";
  const isCount = aggregation === "count" || aggregation === "count_pct";

  const seedFormulaFromSimple = (): ChartSeries[] => {
    const fn = AGG_TO_FN[aggregation];
    if (fn === "count") return [{ id: genId(), expr: aggToString("count", null) }];
    if (fn && draft.yKeys.length > 0) {
      return draft.yKeys
        .filter((k) => k !== "__count__")
        .map((col) => ({ id: genId(), expr: aggToString(fn, col) }));
    }
    return [{ id: genId(), expr: "" }];
  };

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    if (next === "formula") {
      patchDraft({
        series: seedFormulaFromSimple(),
        aggregation: "none",
        yKeys: [],
      });
      setMode("formula");
    } else {
      const hasContent = draft.series?.some((s) => s.expr.trim());
      const doSwitch = () => {
        patchDraft({ series: undefined, aggregation: "count", yKeys: [] });
        setMode("simple");
      };
      if (hasContent) {
        Modal.confirm({
          title: "Voltar ao modo simples?",
          content: "As fórmulas montadas serão descartadas.",
          okText: "Descartar",
          cancelText: "Cancelar",
          onOk: doSwitch,
        });
      } else {
        doSwitch();
      }
    }
  };

  // --- Formula series editing ---
  const series = draft.series ?? [];
  const updateSeries = (next: ChartSeries[]) => patchDraft({ series: next });
  const patchSeries = (id: string, patch: Partial<ChartSeries>) =>
    updateSeries(series.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  return (
    <Flex vertical gap="middle">
      <Segmented
        options={[
          { label: "Simples", value: "simple" },
          { label: "Fórmula (avançado)", value: "formula" },
        ]}
        value={mode}
        onChange={(v) => switchMode(v as Mode)}
      />

      {mode === "simple" ? (
        <Flex vertical gap="middle">
          <div>
            <label style={labelStyle}>O que medir?</label>
            <Select
              style={{ width: "100%" }}
              value={aggregation}
              onChange={(val) => patchDraft({ aggregation: val })}
              options={[
                { label: "Contar registros", value: "count" },
                { label: "Contar registros (%)", value: "count_pct" },
                { label: "Somar uma coluna", value: "sum" },
                { label: "Média de uma coluna", value: "avg" },
                { label: "Mínimo de uma coluna", value: "min" },
                { label: "Máximo de uma coluna", value: "max" },
                { label: "Valor bruto (sem agregar)", value: "none" },
              ]}
            />
            <div style={hintStyle}>
              "Contar registros" conta quantas linhas há em cada categoria do eixo X.
            </div>
          </div>

          {!isCount && (
            <div>
              <label style={labelStyle}>Coluna de valor (eixo Y)</label>
              <Select
                mode={isSingleValue ? undefined : "multiple"}
                placeholder="Selecione a(s) coluna(s) numérica(s)"
                style={{ width: "100%" }}
                value={isSingleValue ? draft.yKeys[0] : draft.yKeys}
                onChange={(val) =>
                  patchDraft({
                    yKeys: Array.isArray(val) ? val : val ? [val] : [],
                  })
                }
                options={keys.map((k) => ({ label: k, value: k }))}
                maxTagCount="responsive"
              />
            </div>
          )}
        </Flex>
      ) : (
        <Flex vertical gap="middle">
          <Alert
            type="info"
            showIcon
            message="Cada medida é uma agregação (ex.: contagem, soma) de uma coluna. Combine medidas com os operadores + − × ÷ para montar taxas e percentuais — ex.: contagem(aceitos) ÷ contagem(total) × 100."
          />
          {series.map((s, idx) => (
            <div
              key={s.id}
              style={{
                border: "1px solid #f0f0f0",
                borderRadius: 6,
                padding: 12,
              }}
            >
              <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                <strong style={{ fontSize: 13 }}>Métrica {idx + 1}</strong>
                {series.length > 1 && (
                  <Button
                    danger
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => updateSeries(series.filter((x) => x.id !== s.id))}
                  />
                )}
              </Flex>
              <FormulaBuilder
                expr={s.expr}
                keys={keys}
                schema={schema}
                onChange={(expr) => patchSeries(s.id, { expr })}
              />
              <div style={{ marginTop: 8 }}>
                <label style={labelStyle}>Nome exibido (opcional)</label>
                <Input
                  size="small"
                  placeholder="Ex.: Taxa de adesão (%)"
                  value={s.label ?? ""}
                  onChange={(e) => patchSeries(s.id, { label: e.target.value })}
                  style={{ maxWidth: 320 }}
                />
              </div>
            </div>
          ))}
          <Space>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => updateSeries([...series, { id: genId(), expr: "" }])}
            >
              Adicionar métrica
            </Button>
          </Space>
          {isSingleValue && series.length > 1 && (
            <Alert
              type="warning"
              showIcon
              message="Este tipo de gráfico usa apenas a primeira métrica."
            />
          )}
        </Flex>
      )}
    </Flex>
  );
}
