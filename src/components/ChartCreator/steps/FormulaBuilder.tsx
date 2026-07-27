import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { Button, Checkbox, Flex, Input, InputNumber, Select, Space, Tag, Tooltip } from "antd";
import {
  CloseOutlined,
  EditOutlined,
  FunctionOutlined,
  GroupOutlined,
  HolderOutlined,
  NumberOutlined,
} from "@ant-design/icons";
import { Reorder, useDragControls } from "motion/react";
import {
  AGG_FUNCTIONS,
  makeToken,
  tokensToExpr,
  exprToTokens,
  validateExpr,
  type BuilderToken,
  type AggFn,
} from "../expression/exprEngine";
import type { ColumnSchema } from "../types";
import { hintStyle } from "./fieldStyles";

interface FormulaBuilderProps {
  expr: string;
  keys: string[];
  schema: ColumnSchema[];
  onChange: (expr: string) => void;
}

const OPERATORS: { op: "+" | "-" | "*" | "/"; symbol: string; title: string }[] = [
  { op: "+", symbol: "+", title: "somar" },
  { op: "-", symbol: "−", title: "subtrair" },
  { op: "*", symbol: "×", title: "multiplicar" },
  { op: "/", symbol: "÷", title: "dividir" },
];

const fnOptions = AGG_FUNCTIONS.map((f) => ({ label: f.label, value: f.fn }));

const canvasStyle: CSSProperties = {
  minHeight: 56,
  border: "1px dashed #d9d9d9",
  borderRadius: 8,
  padding: "12px 14px",
  background: "#fafafa",
};

const groupLabelStyle: CSSProperties = {
  fontSize: 11,
  color: "#8c8c8c",
  textTransform: "uppercase",
  letterSpacing: 0.4,
  marginBottom: 6,
};

/** A labeled cluster of toolbar buttons, separated from its neighbours. */
function ToolGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div style={groupLabelStyle}>{label}</div>
      <Flex gap={6} align="center">
        {children}
      </Flex>
    </div>
  );
}

/**
 * A single reorderable row in the vertical token list. In normal mode it shows
 * a drag handle (the only thing that starts a drag, so the inner Selects keep
 * working); in grouping mode the handle is replaced by a checkbox used to pick
 * the items to wrap in parentheses.
 */
function SortableChip({
  token,
  checked,
  groupingMode,
  onToggle,
  children,
}: {
  token: BuilderToken;
  checked: boolean;
  groupingMode: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      as="div"
      value={token}
      dragListener={false}
      dragControls={controls}
      style={{ listStyle: "none" }}
    >
      <Flex
        align="center"
        gap={10}
        style={{
          background: checked ? "#e6f4ff" : "#fff",
          border: `1px solid ${checked ? "#91caff" : "#f0f0f0"}`,
          borderRadius: 8,
          padding: "6px 10px",
        }}
      >
        {groupingMode ? (
          <Checkbox checked={checked} onChange={() => onToggle(token.id)} />
        ) : (
          <span
            onPointerDown={(e) => controls.start(e)}
            style={{
              cursor: "grab",
              touchAction: "none",
              color: "#bfbfbf",
              display: "flex",
              fontSize: 16,
            }}
            title="Arraste para reordenar"
          >
            <HolderOutlined />
          </span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </Flex>
    </Reorder.Item>
  );
}

export function FormulaBuilder({ expr, keys, schema, onChange }: FormulaBuilderProps) {
  const [tokens, setTokensState] = useState<BuilderToken[]>(
    () => exprToTokens(expr) ?? [],
  );
  const [textMode, setTextMode] = useState(false);
  const [text, setText] = useState(expr);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [groupingMode, setGroupingMode] = useState(false);

  const columnOptions = keys.map((k) => ({ label: k, value: k }));

  const exitGroupingMode = () => {
    setGroupingMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const commitTokens = (next: BuilderToken[]) => {
    setTokensState(next);
    const nextExpr = tokensToExpr(next);
    setText(nextExpr);
    onChange(nextExpr);
  };

  const append = (token: BuilderToken) => commitTokens([...tokens, token]);

  const updateToken = (id: string, patch: Partial<BuilderToken>) =>
    commitTokens(
      tokens.map((t) => (t.id === id ? ({ ...t, ...patch } as BuilderToken) : t)),
    );

  const removeToken = (id: string) => {
    commitTokens(tokens.filter((t) => t.id !== id));
    setSelectedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Indices of the currently checked tokens, in canvas order.
  const selectedIndices = tokens
    .map((t, i) => (selectedIds.has(t.id) ? i : -1))
    .filter((i) => i >= 0);

  // Wrapping in parentheses only makes sense for an unbroken run of ≥2 tokens.
  const canGroup =
    selectedIndices.length >= 2 &&
    selectedIndices[selectedIndices.length - 1] - selectedIndices[0] ===
      selectedIndices.length - 1;

  const groupSelection = () => {
    if (!canGroup) return;
    const i = selectedIndices[0];
    const j = selectedIndices[selectedIndices.length - 1];
    commitTokens([
      ...tokens.slice(0, i),
      makeToken.lparen(),
      ...tokens.slice(i, j + 1),
      makeToken.rparen(),
      ...tokens.slice(j + 1),
    ]);
    exitGroupingMode();
  };

  const handleTextChange = (value: string) => {
    setText(value);
    onChange(value);
    // Keep the visual builder in sync when the text is parseable.
    const parsed = exprToTokens(value);
    if (parsed) setTokensState(parsed);
  };

  const validation = validateExpr(text, schema);
  const isEmpty = !text.trim();

  const renderChip = (token: BuilderToken) => {
    switch (token.kind) {
      case "agg":
        return (
          <Space.Compact key={token.id}>
            <Select
              value={token.fn}
              onChange={(fn: AggFn) => updateToken(token.id, { fn })}
              options={fnOptions}
              style={{ width: 116 }}
            />
            <Select
              allowClear
              showSearch
              placeholder={token.fn === "count" ? "(registros)" : "coluna"}
              value={token.column ?? undefined}
              onChange={(column) => updateToken(token.id, { column: column ?? null })}
              options={columnOptions}
              style={{ width: 168 }}
            />
            <Tooltip title="Remover medida">
              <Button icon={<CloseOutlined />} onClick={() => removeToken(token.id)} />
            </Tooltip>
          </Space.Compact>
        );
      case "number":
        return (
          <Space.Compact key={token.id}>
            <InputNumber
              value={token.value === "" ? null : Number(token.value)}
              onChange={(v) => updateToken(token.id, { value: v == null ? "" : String(v) })}
              style={{ width: 104 }}
            />
            <Tooltip title="Remover número">
              <Button icon={<CloseOutlined />} onClick={() => removeToken(token.id)} />
            </Tooltip>
          </Space.Compact>
        );
      case "op":
        return (
          <Space.Compact key={token.id}>
            <Select
              value={token.op}
              onChange={(op) => updateToken(token.id, { op })}
              options={OPERATORS.map((o) => ({ label: o.symbol, value: o.op }))}
              style={{ width: 68 }}
            />
            <Tooltip title="Remover operador">
              <Button icon={<CloseOutlined />} onClick={() => removeToken(token.id)} />
            </Tooltip>
          </Space.Compact>
        );
      case "lparen":
      case "rparen":
        return (
          <Tag
            key={token.id}
            closable
            onClose={() => removeToken(token.id)}
            style={{ fontSize: 18, padding: "4px 12px", margin: 0, lineHeight: 1.6 }}
          >
            {token.kind === "lparen" ? "(" : ")"}
          </Tag>
        );
    }
  };

  if (textMode) {
    return (
      <Flex vertical gap={4}>
        <Space.Compact style={{ width: "100%" }}>
          <Input
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="ex.: contagem(a) / contagem(b) * 100"
            style={{ fontFamily: "monospace" }}
          />
          <Tooltip title="Voltar ao construtor visual">
            <Button
              icon={<FunctionOutlined />}
              onClick={() => setTextMode(false)}
              disabled={!isEmpty && !exprToTokens(text)}
            />
          </Tooltip>
        </Space.Compact>
        {!isEmpty && !validation.ok && (
          <span style={{ color: "#cf1322", fontSize: 12 }}>{validation.error}</span>
        )}
        {validation.ok && validation.warning && (
          <span style={{ color: "#d46b08", fontSize: 12 }}>{validation.warning}</span>
        )}
      </Flex>
    );
  }

  return (
    <Flex vertical gap={14}>
      {/* Formula canvas: one token per row. Drag the handle to reorder (Y axis
          is far more reliable than a wrapping horizontal list). */}
      <div
        style={{
          ...canvasStyle,
          ...(groupingMode ? { borderColor: "#1677ff", background: "#f0f8ff" } : null),
        }}
      >
        {tokens.length === 0 ? (
          <span style={hintStyle}>
            Comece por “Adicionar medida”. Depois combine com os operadores para montar taxas e
            percentuais.
          </span>
        ) : (
          <Reorder.Group
            as="div"
            axis="y"
            values={tokens}
            onReorder={commitTokens}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {tokens.map((token) => (
              <SortableChip
                key={token.id}
                token={token}
                checked={selectedIds.has(token.id)}
                groupingMode={groupingMode}
                onToggle={toggleSelect}
              >
                {renderChip(token)}
              </SortableChip>
            ))}
          </Reorder.Group>
        )}
      </div>
      {tokens.length > 0 && (
        <span
          style={{
            ...hintStyle,
            marginTop: -6,
            ...(groupingMode ? { color: "#1677ff" } : null),
          }}
        >
          {groupingMode
            ? "Marque 2 ou mais itens seguidos e confirme para envolvê-los em ( )."
            : "Arraste os itens pela alça (⠿) para reordenar."}
        </span>
      )}

      {/* Toolbar: while grouping, everything collapses to confirm/cancel so the
          user stays focused on picking the range. */}
      {groupingMode ? (
        <Flex gap={8} align="center">
          <Button
            type="primary"
            icon={<GroupOutlined />}
            disabled={!canGroup}
            onClick={groupSelection}
          >
            Agrupar selecionados
          </Button>
          <Button onClick={exitGroupingMode}>Cancelar</Button>
        </Flex>
      ) : (
      <Flex gap={28} wrap="wrap" align="flex-start">
        <ToolGroup label="Medida">
          <Button
            type="primary"
            ghost
            icon={<FunctionOutlined />}
            onClick={() => append(makeToken.agg("count", null))}
          >
            Adicionar medida
          </Button>
        </ToolGroup>

        <ToolGroup label="Operadores">
          {OPERATORS.map((o) => (
            <Tooltip key={o.op} title={o.title}>
              <Button
                onClick={() => append(makeToken.op(o.op))}
                style={{ width: 40, fontSize: 16, padding: 0 }}
              >
                {o.symbol}
              </Button>
            </Tooltip>
          ))}
        </ToolGroup>

        <ToolGroup label="Valor fixo">
          <Button icon={<NumberOutlined />} onClick={() => append(makeToken.number("0"))}>
            Número
          </Button>
        </ToolGroup>

        <ToolGroup label="Agrupar">
          <Tooltip title={tokens.length >= 2 ? "" : "Adicione ao menos 2 itens para agrupar"}>
            {/* span keeps the tooltip working while the button is disabled */}
            <span>
              <Button
                icon={<GroupOutlined />}
                disabled={tokens.length < 2}
                onClick={() => setGroupingMode(true)}
              >
                Agrupar itens
              </Button>
            </span>
          </Tooltip>
        </ToolGroup>

        <div style={{ marginLeft: "auto" }}>
          <div style={groupLabelStyle}>&nbsp;</div>
          <Tooltip title="Digitar a fórmula manualmente (avançado)">
            <Button type="text" icon={<EditOutlined />} onClick={() => setTextMode(true)}>
              Editar como texto
            </Button>
          </Tooltip>
        </div>
      </Flex>
      )}

      {!isEmpty && (
        <div>
          <code
            style={{
              display: "inline-block",
              background: "#f5f5f5",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 12,
              color: validation.ok ? "#389e0d" : "#cf1322",
            }}
          >
            {text}
          </code>
          {!validation.ok && (
            <div style={{ color: "#cf1322", fontSize: 12, marginTop: 2 }}>{validation.error}</div>
          )}
          {validation.ok && validation.warning && (
            <div style={{ color: "#d46b08", fontSize: 12, marginTop: 2 }}>{validation.warning}</div>
          )}
        </div>
      )}
    </Flex>
  );
}
