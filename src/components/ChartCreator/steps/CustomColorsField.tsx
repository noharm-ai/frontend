import { useMemo } from "react";
import { Alert, Button, ColorPicker, Empty, Flex, Tooltip } from "antd";
import { UndoOutlined } from "@ant-design/icons";
import { getColorTargets } from "../utils";
import { hintStyle } from "./fieldStyles";
import type { ChartConfig, ColorScope } from "../types";

// Semantic shortcuts for the common "good vs bad" reading of a chart, plus the
// NoHarm brand colors, offered inside every picker.
const COLOR_PRESETS = [
  {
    label: "Semânticas",
    colors: ["#389e0d", "#7ebe9a", "#f2b530", "#fa8c16", "#e46666", "#cf1322", "#8c8c8c"],
  },
  {
    label: "NoHarm",
    colors: ["#2e3c5a", "#7ebe9a", "#70bdc3", "#e46666", "#f2b530", "#696766"],
  },
];

// Beyond this many categories the list stops being usable as a form.
const MAX_LISTED_TARGETS = 60;

const SCOPE_HINT: Record<ColorScope, string> = {
  series: "Cada métrica do gráfico recebe uma cor.",
  category: "Cada categoria do eixo X recebe uma cor.",
};

interface CustomColorsFieldProps {
  draft: ChartConfig;
  patchDraft: (patch: Partial<ChartConfig>) => void;
  /** Rows already narrowed by the chart's own filters. */
  data: any[];
}

/**
 * Per-item color pickers. Which items are listed (metrics or categories)
 * depends on the chart type and metric count — see `getColorScope`. Items the
 * user never touches stay out of the config and keep the automatic color.
 */
export function CustomColorsField({ draft, patchDraft, data }: CustomColorsFieldProps) {
  const { scope, targets } = useMemo(() => {
    try {
      return getColorTargets(data, draft);
    } catch {
      return { scope: "series" as ColorScope, targets: [] };
    }
  }, [data, draft]);

  const colors = (scope === "series" ? draft.seriesColors : draft.categoryColors) ?? {};

  const setColor = (key: string, color: string | undefined) => {
    const next = { ...colors };
    if (color) {
      next[key] = color;
    } else {
      delete next[key];
    }
    patchDraft(scope === "series" ? { seriesColors: next } : { categoryColors: next });
  };

  if (!targets.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Nada para colorir ainda — defina os dados e as métricas do gráfico."
      />
    );
  }

  const listed = targets.slice(0, MAX_LISTED_TARGETS);
  const customCount = Object.keys(colors).length;

  return (
    <Flex vertical gap={8}>
      <div style={hintStyle}>
        {SCOPE_HINT[scope]} As que você não alterar seguem a paleta automática.
      </div>

      <Flex vertical gap={6} style={{ maxHeight: 260, overflowY: "auto", paddingRight: 4 }}>
        {listed.map((target) => {
          const custom = colors[target.key];
          return (
            <Flex key={target.key} align="center" gap={8}>
              <ColorPicker
                value={custom ?? target.autoColor}
                presets={COLOR_PRESETS}
                disabledAlpha
                onChangeComplete={(color) => setColor(target.key, color.toHexString())}
              />
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: 13,
                  color: custom ? "#454545" : "#8c8c8c",
                }}
                title={target.label}
              >
                {target.label || "(vazio)"}
              </span>
              {custom && (
                <Tooltip title="Voltar para a cor automática">
                  <Button
                    type="text"
                    size="small"
                    icon={<UndoOutlined />}
                    onClick={() => setColor(target.key, undefined)}
                  />
                </Tooltip>
              )}
            </Flex>
          );
        })}
      </Flex>

      {targets.length > listed.length && (
        <Alert
          type="info"
          showIcon
          message={`Mostrando as ${MAX_LISTED_TARGETS} primeiras de ${targets.length} categorias. Use "Top N" ou filtros para reduzir a lista.`}
        />
      )}

      {customCount > 0 && (
        <div>
          <Button
            size="small"
            onClick={() =>
              patchDraft(scope === "series" ? { seriesColors: {} } : { categoryColors: {} })
            }
          >
            Limpar cores definidas ({customCount})
          </Button>
        </div>
      )}
    </Flex>
  );
}
