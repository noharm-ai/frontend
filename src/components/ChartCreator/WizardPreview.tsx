import { useDeferredValue, useMemo } from "react";
import { Empty } from "antd";
import { EChartBase } from "src/components/EChartBase";
import { applyFilters } from "src/utils/dataFilters";
import { getChartOption } from "./utils";
import type { ChartConfig, ColumnSchema } from "./types";

interface WizardPreviewProps {
  draft: ChartConfig;
  data: any[];
  schema: ColumnSchema[];
}

/** Whether the current draft has enough information to render a chart. */
function isDraftRenderable(draft: ChartConfig): boolean {
  // Gauge needs no X axis; every other type does.
  if (draft.type !== "gauge" && (!draft.xKeys || draft.xKeys.length === 0)) return false;
  const hasExpression = !!draft.series && draft.series.length > 0;
  if (hasExpression) return draft.series!.some((s) => !!s.expr?.trim());
  const isCount = draft.aggregation === "count" || draft.aggregation === "count_pct";
  return isCount || draft.yKeys.length > 0;
}

// Rendering re-evaluates aggregations on every keystroke while building an
// expression; the settings object is stable and `notMerge` avoids ghost series
// when the chart type or series count changes.
const PREVIEW_SETTINGS = { notMerge: true } as const;

// Stable references: EChartBase re-initializes (dispose + recreate) whenever
// `onClick` identity changes, which would blank the canvas on every parent
// re-render (e.g. clicking "Próximo"). Keep these module-level constants.
const NOOP = () => {};
const PREVIEW_STYLE = { height: "100%", minHeight: 320, width: "100%" } as const;

export function WizardPreview({ draft, data, schema }: WizardPreviewProps) {
  // Defer the draft so rapid edits (typing an expression) don't thrash ECharts.
  const deferred = useDeferredValue(draft);
  const renderable = isDraftRenderable(deferred);

  const filteredData = useMemo(
    () => applyFilters(data, deferred.filters ?? [], schema),
    [data, deferred.filters, schema],
  );

  const option = useMemo(
    () => (renderable ? getChartOption(filteredData, deferred) : null),
    [renderable, filteredData, deferred],
  );

  if (!renderable || !option) {
    return (
      <div
        style={{
          height: "100%",
          minHeight: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Escolha o eixo X e ao menos uma métrica para ver o gráfico"
        />
      </div>
    );
  }

  return (
    <EChartBase
      option={option}
      style={PREVIEW_STYLE}
      loading={false}
      settings={PREVIEW_SETTINGS}
      theme={undefined}
      onClick={NOOP}
    />
  );
}
