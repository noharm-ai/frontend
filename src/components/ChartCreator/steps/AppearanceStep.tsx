import { InputNumber, Flex, Input, Segmented, Switch, Row, Col } from "antd";
import {
  MinusOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from "@ant-design/icons";
import { labelStyle, PALETTE_OPTIONS } from "./fieldStyles";
import type { ColorPalette, SortOrder } from "../types";
import type { WizardStepProps } from "./StepProps";

// Sample colors shown for the "Padrão" (echarts default) palette preview.
const DEFAULT_SAMPLE = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de"];

// NoHarm brand green (styles/colors accent) for the active palette highlight.
const NOHARM_GREEN = "#7ebe9a";

const SORT_OPTIONS = [
  { value: "none" as SortOrder, label: <MinusOutlined /> },
  { value: "asc" as SortOrder, label: <SortAscendingOutlined /> },
  { value: "desc" as SortOrder, label: <SortDescendingOutlined /> },
];

function PaletteToggle({
  value,
  onChange,
}: {
  value: ColorPalette;
  onChange: (v: ColorPalette) => void;
}) {
  return (
    <Flex gap={8} wrap="wrap">
      {PALETTE_OPTIONS.map(({ label, value: pv, colors }) => {
        const selected = value === pv;
        const swatches = colors.length ? colors : DEFAULT_SAMPLE;
        return (
          <button
            key={pv}
            type="button"
            onClick={() => onChange(pv)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              borderRadius: 6,
              cursor: "pointer",
              background: selected ? "#f0f9f4" : "#fff",
              border: `1px solid ${selected ? NOHARM_GREEN : "#d9d9d9"}`,
            }}
          >
            <span style={{ display: "flex", gap: 2 }}>
              {swatches.map((c, i) => (
                <span
                  key={i}
                  style={{ width: 10, height: 10, borderRadius: 2, background: c, display: "inline-block" }}
                />
              ))}
            </span>
            <span style={{ fontSize: 12 }}>{label}</span>
          </button>
        );
      })}
    </Flex>
  );
}

export function AppearanceStep({ draft, patchDraft }: WizardStepProps) {
  const type = draft.type;
  const referenceLine = draft.referenceLine;
  const isAxisChart = type === "bar" || type === "hbar" || type === "line";

  // The gauge has a much smaller set of relevant options.
  if (type === "gauge") {
    return (
      <Flex vertical gap="middle">
        <div>
          <label style={labelStyle}>Paleta de cores</label>
          <PaletteToggle
            value={draft.colorPalette ?? "default"}
            onChange={(v) => patchDraft({ colorPalette: v })}
          />
        </div>
        <Row gutter={16}>
          <Col span={12}>
            <label style={labelStyle}>Valor máximo do medidor</label>
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="Automático"
              value={draft.gaugeMax}
              onChange={(v) => patchDraft({ gaugeMax: v ?? undefined })}
            />
          </Col>
          <Col span={12}>
            <label style={labelStyle}>Altura (px)</label>
            <InputNumber
              min={200}
              max={1200}
              step={50}
              style={{ width: "100%" }}
              value={draft.height ?? 400}
              onChange={(val) => patchDraft({ height: val ?? 400 })}
            />
          </Col>
        </Row>
      </Flex>
    );
  }

  return (
    <Flex vertical gap="middle">
      <div>
        <label style={labelStyle}>Paleta de cores</label>
        <PaletteToggle
          value={draft.colorPalette ?? "default"}
          onChange={(v) => patchDraft({ colorPalette: v })}
        />
      </div>

      <Row gutter={16}>
        <Col span={12}>
          <label style={labelStyle}>Ordenar por valor</label>
          <Segmented
            block
            value={draft.sortOrder ?? "none"}
            onChange={(v) => patchDraft({ sortOrder: v as SortOrder })}
            options={SORT_OPTIONS}
          />
        </Col>
        <Col span={12}>
          <label style={labelStyle}>Ordenar eixo X</label>
          <Segmented
            block
            value={draft.xSortOrder ?? "none"}
            onChange={(v) => patchDraft({ xSortOrder: v as SortOrder })}
            options={SORT_OPTIONS}
          />
        </Col>
      </Row>

      {isAxisChart && (
        <div>
          <label style={labelStyle}>Rotação dos rótulos do eixo X</label>
          <Segmented
            value={draft.xLabelRotate ?? 0}
            onChange={(v) => patchDraft({ xLabelRotate: Number(v) })}
            options={[
              { value: 0, label: "0°" },
              { value: 45, label: "45°" },
              { value: 90, label: "90°" },
            ]}
          />
        </div>
      )}

      <Row gutter={16}>
        <Col span={12}>
          <label style={labelStyle}>Mostrar apenas os maiores (Top N)</label>
          <InputNumber
            min={0}
            step={1}
            style={{ width: "100%" }}
            placeholder="0 = todos"
            value={draft.topN ?? 0}
            onChange={(val) => patchDraft({ topN: val ?? 0 })}
          />
        </Col>
        <Col span={12}>
          <label style={labelStyle}>Altura (px)</label>
          <InputNumber
            min={200}
            max={1200}
            step={50}
            style={{ width: "100%" }}
            value={draft.height ?? 400}
            onChange={(val) => patchDraft({ height: val ?? 400 })}
          />
        </Col>
      </Row>

      <Row gutter={16} align="middle">
        <Col span={12} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Switch
            checked={draft.showLabels ?? false}
            onChange={(v) => patchDraft({ showLabels: v })}
            size="small"
          />
          <label
            style={{ cursor: "pointer" }}
            onClick={() => patchDraft({ showLabels: !(draft.showLabels ?? false) })}
          >
            Rótulos nos dados
          </label>
        </Col>
        {(type === "bar" || type === "hbar") && (
          <Col span={12} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Switch
              checked={draft.stacked ?? false}
              onChange={(v) => patchDraft({ stacked: v })}
              size="small"
            />
            <label
              style={{ cursor: "pointer" }}
              onClick={() => patchDraft({ stacked: !(draft.stacked ?? false) })}
            >
              Barras empilhadas
            </label>
          </Col>
        )}
      </Row>

      {isAxisChart && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: referenceLine ? 4 : 0 }}>
            <Switch
              checked={!!referenceLine}
              onChange={(on) => patchDraft({ referenceLine: on ? { value: 0, label: "" } : undefined })}
              size="small"
            />
            <label
              style={{ cursor: "pointer" }}
              onClick={() => patchDraft({ referenceLine: referenceLine ? undefined : { value: 0, label: "" } })}
            >
              Linha de referência
            </label>
          </div>
          {referenceLine && (
            <Row gutter={8} style={{ marginTop: 4 }}>
              <Col span={8}>
                <label style={labelStyle}>Valor</label>
                <InputNumber
                  style={{ width: "100%" }}
                  value={referenceLine.value}
                  onChange={(v) => patchDraft({ referenceLine: { ...referenceLine, value: v ?? 0 } })}
                />
              </Col>
              <Col span={16}>
                <label style={labelStyle}>Rótulo (opcional)</label>
                <Input
                  placeholder="ex: Meta"
                  value={referenceLine.label ?? ""}
                  onChange={(e) => patchDraft({ referenceLine: { ...referenceLine, label: e.target.value } })}
                />
              </Col>
            </Row>
          )}
        </div>
      )}
    </Flex>
  );
}
