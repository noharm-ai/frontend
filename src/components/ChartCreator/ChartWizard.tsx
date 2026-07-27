import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { Button, ConfigProvider, Modal, Steps, Tooltip } from "antd";
import { EnterOutlined } from "@ant-design/icons";
import type { ChartConfig, ColumnSchema } from "./types";
import { WizardPreview } from "./WizardPreview";
import { StartStep } from "./steps/StartStep";
import { FormatStep } from "./steps/FormatStep";
import { DataStep } from "./steps/DataStep";
import { MetricsStep } from "./steps/MetricsStep";
import { AppearanceStep } from "./steps/AppearanceStep";
import { FiltersStep } from "./steps/FiltersStep";
import { validateExpr } from "./expression/exprEngine";

const genId = () => Math.random().toString(36).slice(2, 11);

// NoHarm brand green (styles/colors accent) used to highlight active toggles.
const NOHARM_GREEN = "#7ebe9a";

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPod|iPad/i.test(navigator.platform || navigator.userAgent);

const keyCapStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 16,
  height: 16,
  padding: "0 3px",
  fontSize: 11,
  lineHeight: 1,
  borderRadius: 3,
  border: "1px solid currentColor",
};

/**
 * Renders the keyboard shortcut for a footer button: any modifier keycaps
 * (⇧ / ⌘ / ⌃) followed by the Enter (↵) icon. Uses Unicode key glyphs, so no
 * extra icon library is needed.
 */
function ShortcutHint({ mods }: { mods: string[] }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
      {mods.map((m) => (
        <span key={m} style={keyCapStyle}>
          {m}
        </span>
      ))}
      <EnterOutlined />
    </span>
  );
}

// Save is ⌘+Enter on Mac, Ctrl+Enter elsewhere — show only the current OS's key.
const SAVE_MODS = [isMac ? "⌘" : "⌃"];
const SAVE_SHORTCUT = isMac ? "⌘+Enter" : "Ctrl+Enter";

const makeDefaultDraft = (): ChartConfig => ({
  id: genId(),
  type: "bar",
  xKeys: [],
  yKeys: [],
  title: "",
  width: "half",
  aggregation: "count",
  sortOrder: "none",
  xSortOrder: "none",
  xLabelRotate: 0,
  topN: 0,
  showLabels: false,
  height: 400,
  dateGrouping: "none",
  referenceLine: undefined,
  showTitle: true,
  colorPalette: "default",
  stacked: false,
  filters: [],
});

interface ChartWizardProps {
  open: boolean;
  data: any[];
  schema: ColumnSchema[];
  keys: string[];
  /** The chart being edited, or null when creating a new one. */
  editingChart: ChartConfig | null;
  /** Pre-selected chart type for a quick start (skips the Start step). */
  initialType?: ChartConfig["type"] | null;
  /** Opens the wizard straight into the "Gerar com agente" step. */
  openToAgent?: boolean;
  onCancel: () => void;
  onFinish: (chart: ChartConfig) => void;
  onGenerateCharts?: (hint: string) => Promise<ChartConfig[]>;
}

const metricsValid = (draft: ChartConfig, schema: ColumnSchema[]): boolean => {
  if (draft.series && draft.series.length > 0) {
    return draft.series.every((s) => validateExpr(s.expr, schema).ok);
  }
  const isCount = draft.aggregation === "count" || draft.aggregation === "count_pct";
  return isCount || draft.yKeys.length > 0;
};

const dataValid = (draft: ChartConfig): boolean => {
  // The gauge has no X axis; it only needs a title (and a metric).
  if (draft.type === "gauge") return !!draft.title.trim();
  return draft.xKeys.length > 0 && !!draft.title.trim();
};

export function ChartWizard({
  open,
  data,
  schema,
  keys,
  editingChart,
  initialType,
  openToAgent,
  onCancel,
  onFinish,
  onGenerateCharts,
}: ChartWizardProps) {
  const isEditing = !!editingChart;
  const [draft, setDraft] = useState<ChartConfig>(makeDefaultDraft);
  const [stepIndex, setStepIndex] = useState(0);

  // (Re)initialize whenever the wizard opens or the target chart changes.
  useEffect(() => {
    if (!open) return;
    setDraft(
      editingChart
        ? { ...editingChart }
        : { ...makeDefaultDraft(), ...(initialType ? { type: initialType } : {}) },
    );
    setStepIndex(0);
  }, [open, editingChart, initialType, openToAgent]);

  const patchDraft = (patch: Partial<ChartConfig>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const stepProps = { draft, patchDraft, keys, schema };

  const steps = useMemo(() => {
    const list: { key: string; title: string; content: React.ReactNode; valid: boolean }[] = [];
    if (!isEditing && openToAgent) {
      list.push({
        key: "start",
        title: "Gerar",
        valid: true,
        content: (
          <StartStep
            agentOnly
            onGenerateCharts={onGenerateCharts}
            onStartBlank={() => setStepIndex((i) => i + 1)}
            onGenerated={(chart) => {
              setDraft({ ...makeDefaultDraft(), ...chart, id: genId() });
              setStepIndex((i) => i + 1);
            }}
          />
        ),
      });
    }
    list.push(
      { key: "format", title: "Formato", valid: true, content: <FormatStep {...stepProps} /> },
      { key: "data", title: "Dados", valid: dataValid(draft), content: <DataStep {...stepProps} /> },
      { key: "metrics", title: "Métricas", valid: metricsValid(draft, schema), content: <MetricsStep {...stepProps} /> },
      { key: "appearance", title: "Estilo", valid: true, content: <AppearanceStep {...stepProps} /> },
      { key: "filters", title: "Filtros", valid: true, content: <FiltersStep {...stepProps} /> },
    );
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, openToAgent, draft, schema, keys, onGenerateCharts]);

  const current = steps[Math.min(stepIndex, steps.length - 1)];
  const isLast = stepIndex === steps.length - 1;
  const isStartStep = current?.key === "start";

  const allValid = dataValid(draft) && metricsValid(draft, schema);
  const canAdvance = current?.valid ?? true;

  // Keyboard shortcuts: Enter advances, Shift+Enter goes back, Ctrl/⌘+Enter saves.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (e.metaKey || e.ctrlKey) {
        if (allValid) {
          e.preventDefault();
          onFinish(draft);
        }
        return;
      }
      if (isStartStep) return;
      const el = e.target as HTMLElement | null;
      // Enter has its own meaning inside a textarea or on a focused button.
      if (el && (el.closest("textarea") || el.closest("button"))) return;
      // Let an open Select/AutoComplete dropdown consume Enter itself.
      if (document.querySelector(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")) return;
      if (e.shiftKey) {
        if (stepIndex > 0) {
          e.preventDefault();
          setStepIndex((i) => i - 1);
        }
        return;
      }
      if (!isLast && canAdvance) {
        e.preventDefault();
        setStepIndex((i) => i + 1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, isStartStep, isLast, canAdvance, allValid, draft, onFinish, stepIndex]);

  const saveButton = (
    <Tooltip key="finish" title={`Salvar (${SAVE_SHORTCUT})`}>
      <Button
        type={isLast ? "primary" : "default"}
        disabled={!allValid}
        icon={<ShortcutHint mods={SAVE_MODS} />}
        onClick={() => onFinish(draft)}
      >
        {isEditing ? "Salvar alterações" : "Adicionar gráfico"}
      </Button>
    </Tooltip>
  );
  const nextButton = (
    <Tooltip key="next" title="Próximo (Enter)">
      <Button
        type="primary"
        disabled={!canAdvance}
        icon={<ShortcutHint mods={[]} />}
        onClick={() => setStepIndex((i) => i + 1)}
      >
        Próximo
      </Button>
    </Tooltip>
  );

  // While editing, Save is available on every step; when creating, it appears
  // only on the last step.
  const actionButtons = isLast
    ? [saveButton]
    : isEditing
      ? [saveButton, nextButton]
      : [nextButton];

  const footer = isStartStep
    ? [
        <Button key="cancel" onClick={onCancel}>
          Cancelar
        </Button>,
      ]
    : [
        <Button key="cancel" onClick={onCancel}>
          Cancelar
        </Button>,
        <Tooltip key="back" title="Voltar (Shift+Enter)">
          <Button
            disabled={stepIndex === 0}
            icon={<ShortcutHint mods={["⇧"]} />}
            onClick={() => setStepIndex((i) => i - 1)}
          >
            Voltar
          </Button>
        </Tooltip>,
        ...actionButtons,
      ];

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={isEditing ? "Editar gráfico" : "Adicionar gráfico"}
      width="92vw"
      style={{ top: 24, maxWidth: 1440, paddingBottom: 0 }}
      styles={{ body: { height: "calc(100vh - 180px)", overflow: "hidden", padding: 16 } }}
      footer={footer}
      destroyOnHidden
    >
      <ConfigProvider
        theme={{
          components: {
            Segmented: {
              itemSelectedColor: NOHARM_GREEN,
            },
          },
        }}
      >
      <div style={{ display: "flex", gap: 16, height: "100%" }}>
        {/* Left: steps + current step fields */}
        <div
          style={{
            width: 480,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Steps
            size="small"
            current={stepIndex}
            onChange={(i) => setStepIndex(i)}
            items={steps.map((s) => ({
              title: <span style={{ whiteSpace: "nowrap" }}>{s.title}</span>,
            }))}
            style={{ marginBottom: 16 }}
          />
          <div style={{ flex: 1, overflowY: "auto", padding: "6px 10px" }}>{current?.content}</div>
        </div>

        {/* Right: live preview */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            border: "1px solid #f0f0f0",
            borderRadius: 8,
            padding: 12,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Pré-visualização</div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <WizardPreview draft={draft} data={data} schema={schema} />
          </div>
        </div>
      </div>
      </ConfigProvider>
    </Modal>
  );
}
