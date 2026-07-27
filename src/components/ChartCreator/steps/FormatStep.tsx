import { Flex, Segmented } from "antd";
import {
  BarChartOutlined,
  DashboardOutlined,
  FunnelPlotOutlined,
  LineChartOutlined,
  PieChartOutlined,
  RadarChartOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";
import { labelStyle, hintStyle } from "./fieldStyles";
import type { ChartConfig } from "../types";
import type { WizardStepProps } from "./StepProps";

type ChartType = ChartConfig["type"];

const toggleLabel = (icon: ReactNode, text: string) => (
  <Flex vertical align="center" gap={4} style={{ padding: "6px 4px" }}>
    <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
    <span style={{ fontSize: 11 }}>{text}</span>
  </Flex>
);

const TYPE_OPTIONS = [
  { value: "bar" as ChartType, label: toggleLabel(<BarChartOutlined />, "Barras") },
  {
    value: "hbar" as ChartType,
    label: toggleLabel(
      <BarChartOutlined style={{ transform: "rotate(90deg)" }} />,
      "Horizontais",
    ),
  },
  { value: "line" as ChartType, label: toggleLabel(<LineChartOutlined />, "Linha") },
  { value: "pie" as ChartType, label: toggleLabel(<PieChartOutlined />, "Pizza") },
  { value: "funnel" as ChartType, label: toggleLabel(<FunnelPlotOutlined />, "Funil") },
  { value: "gauge" as ChartType, label: toggleLabel(<DashboardOutlined />, "Medidor") },
  { value: "radar" as ChartType, label: toggleLabel(<RadarChartOutlined />, "Radar") },
];

const WidthBox = ({ fill }: { fill: number }) => (
  <span
    style={{
      display: "inline-block",
      width: 34,
      height: 16,
      border: "1px solid currentColor",
      borderRadius: 2,
      position: "relative",
      opacity: 0.9,
    }}
  >
    <span
      style={{
        position: "absolute",
        left: 1,
        top: 1,
        bottom: 1,
        width: `calc(${fill}% - 2px)`,
        background: "currentColor",
        borderRadius: 1,
      }}
    />
  </span>
);

type ChartWidth = ChartConfig["width"];

const WIDTH_OPTIONS = [
  { value: "full" as ChartWidth, label: toggleLabel(<WidthBox fill={100} />, "Tela inteira") },
  { value: "half" as ChartWidth, label: toggleLabel(<WidthBox fill={50} />, "Metade") },
  { value: "third" as ChartWidth, label: toggleLabel(<WidthBox fill={33} />, "Um terço") },
];

export function FormatStep({ draft, patchDraft }: WizardStepProps) {
  return (
    <Flex vertical gap="large">
      <div>
        <label style={labelStyle}>Tipo de gráfico</label>
        <Segmented
          block
          value={draft.type}
          onChange={(v) => patchDraft({ type: v as ChartType })}
          options={TYPE_OPTIONS}
        />
        <div style={hintStyle}>
          Barras/linha comparam categorias; pizza/funil mostram composição e etapas; medidor
          exibe um único valor; radar compara métricas em várias categorias.
        </div>
      </div>

      <div>
        <label style={labelStyle}>Largura no relatório</label>
        <Segmented
          value={draft.width}
          onChange={(v) => patchDraft({ width: v as ChartWidth })}
          options={WIDTH_OPTIONS}
        />
      </div>
    </Flex>
  );
}
