import { InputNumber, Flex, Input, Select, Switch, Row, Col, Button } from "antd";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { AggregationType, DateGrouping, DerivedColumn, ReferenceLine, SortOrder } from "./types";

interface ChartFormFieldsProps {
  title: string;
  setTitle: (val: string) => void;
  xKeys: string[];
  setXKeys: (val: string[]) => void;
  yKeys: string[];
  setYKeys: (val: string[]) => void;
  type: "bar" | "line" | "pie";
  setType: (val: "bar" | "line" | "pie") => void;
  width: "full" | "half";
  setWidth: (val: "full" | "half") => void;
  aggregation: AggregationType;
  setAggregation: (val: AggregationType) => void;
  sortOrder: SortOrder;
  setSortOrder: (val: SortOrder) => void;
  topN: number;
  setTopN: (val: number) => void;
  showLabels: boolean;
  setShowLabels: (val: boolean) => void;
  height: number;
  setHeight: (val: number) => void;
  dateGrouping: DateGrouping;
  setDateGrouping: (val: DateGrouping) => void;
  derivedColumns: DerivedColumn[];
  setDerivedColumns: (cols: DerivedColumn[]) => void;
  referenceLine: ReferenceLine | undefined;
  setReferenceLine: (val: ReferenceLine | undefined) => void;
  keys: string[];
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  color: "#888",
  marginBottom: 2,
};

const OPERATOR_OPTIONS = [
  { label: "+", value: "+" },
  { label: "−", value: "-" },
  { label: "×", value: "*" },
  { label: "÷", value: "/" },
];

function newDerivedColumn(): DerivedColumn {
  return {
    name: "",
    left: { type: "column" },
    operator: "/",
    right: { type: "column" },
  };
}

export const ChartFormFields = ({
  title,
  setTitle,
  xKeys,
  setXKeys,
  yKeys,
  setYKeys,
  type,
  setType,
  width,
  setWidth,
  aggregation,
  setAggregation,
  sortOrder,
  setSortOrder,
  topN,
  setTopN,
  showLabels,
  setShowLabels,
  height,
  setHeight,
  dateGrouping,
  setDateGrouping,
  derivedColumns,
  setDerivedColumns,
  referenceLine,
  setReferenceLine,
  keys,
}: ChartFormFieldsProps) => {
  const allYOptions = [
    ...keys.map((k) => ({ label: k, value: k })),
    ...derivedColumns
      .filter((dc) => dc.name.trim())
      .map((dc) => ({ label: `📐 ${dc.name}`, value: dc.name })),
  ];

  const updateDerived = (index: number, patch: Partial<DerivedColumn>) => {
    setDerivedColumns(
      derivedColumns.map((dc, i) => (i === index ? { ...dc, ...patch } : dc)),
    );
  };

  return (
    <Flex vertical style={{ width: "100%" }} gap="small">
      {/* Title */}
      <div>
        <label style={labelStyle}>Título do Gráfico</label>
        <Input
          placeholder="Digite um título para o gráfico"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* X axis + Date grouping */}
      <Row gutter={8}>
        <Col span={dateGrouping !== "none" ? 14 : 24}>
          <label style={labelStyle}>Eixo X (Categoria)</label>
          <Select
            mode="multiple"
            placeholder="Selecione as colunas para o eixo X"
            style={{ width: "100%" }}
            value={xKeys}
            onChange={setXKeys}
            options={keys.map((k) => ({ label: k, value: k }))}
            maxTagCount="responsive"
          />
        </Col>
        <Col span={dateGrouping !== "none" ? 10 : 24}>
          <label style={labelStyle}>Agrupamento de Data</label>
          <Select
            style={{ width: "100%" }}
            value={dateGrouping}
            onChange={setDateGrouping}
            options={[
              { label: "Nenhum", value: "none" },
              { label: "Dia", value: "day" },
              { label: "Semana", value: "week" },
              { label: "Mês", value: "month" },
              { label: "Trimestre", value: "quarter" },
              { label: "Ano", value: "year" },
            ]}
          />
        </Col>
      </Row>

      {/* Derived columns */}
      <div>
        <label style={labelStyle}>Colunas Derivadas</label>
        <Flex vertical gap={4}>
          {derivedColumns.map((dc, i) => (
            <Row key={i} gutter={4} align="middle" wrap={false}>
              <Col flex="90px">
                <Input
                  placeholder="Nome"
                  value={dc.name}
                  onChange={(e) => updateDerived(i, { name: e.target.value })}
                  size="small"
                />
              </Col>
              {/* Left operand */}
              <Col flex="auto">
                {dc.left.type === "column" ? (
                  <Select
                    size="small"
                    style={{ width: "100%" }}
                    placeholder="Col"
                    value={dc.left.columnKey}
                    onChange={(v) => updateDerived(i, { left: { type: "column", columnKey: v } })}
                    options={keys.map((k) => ({ label: k, value: k }))}
                    popupMatchSelectWidth={false}
                  />
                ) : (
                  <InputNumber
                    size="small"
                    style={{ width: "100%" }}
                    value={dc.left.number}
                    onChange={(v) => updateDerived(i, { left: { type: "number", number: v ?? 0 } })}
                  />
                )}
              </Col>
              <Col flex="28px">
                <Button
                  size="small"
                  type="text"
                  style={{ fontSize: 10, padding: "0 2px", width: "100%" }}
                  onClick={() =>
                    updateDerived(i, {
                      left: dc.left.type === "column"
                        ? { type: "number", number: 0 }
                        : { type: "column" },
                    })
                  }
                >
                  {dc.left.type === "column" ? "#" : "A"}
                </Button>
              </Col>
              {/* Operator */}
              <Col flex="40px">
                <Select
                  size="small"
                  style={{ width: "100%" }}
                  value={dc.operator}
                  onChange={(v) => updateDerived(i, { operator: v })}
                  options={OPERATOR_OPTIONS}
                  popupMatchSelectWidth={false}
                />
              </Col>
              {/* Right operand */}
              <Col flex="auto">
                {dc.right.type === "column" ? (
                  <Select
                    size="small"
                    style={{ width: "100%" }}
                    placeholder="Col"
                    value={dc.right.columnKey}
                    onChange={(v) => updateDerived(i, { right: { type: "column", columnKey: v } })}
                    options={keys.map((k) => ({ label: k, value: k }))}
                    popupMatchSelectWidth={false}
                  />
                ) : (
                  <InputNumber
                    size="small"
                    style={{ width: "100%" }}
                    value={dc.right.number}
                    onChange={(v) => updateDerived(i, { right: { type: "number", number: v ?? 0 } })}
                  />
                )}
              </Col>
              <Col flex="28px">
                <Button
                  size="small"
                  type="text"
                  style={{ fontSize: 10, padding: "0 2px", width: "100%" }}
                  onClick={() =>
                    updateDerived(i, {
                      right: dc.right.type === "column"
                        ? { type: "number", number: 0 }
                        : { type: "column" },
                    })
                  }
                >
                  {dc.right.type === "column" ? "#" : "A"}
                </Button>
              </Col>
              {/* Remove */}
              <Col flex="24px">
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => setDerivedColumns(derivedColumns.filter((_, j) => j !== i))}
                />
              </Col>
            </Row>
          ))}
          <Button
            size="small"
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => setDerivedColumns([...derivedColumns, newDerivedColumn()])}
          >
            Adicionar coluna
          </Button>
        </Flex>
      </div>

      {/* Aggregation + Y axis */}
      <Row gutter={8}>
        <Col span={aggregation !== "count" ? 8 : 24}>
          <label style={labelStyle}>Agregação</label>
          <Select
            style={{ width: "100%" }}
            value={aggregation}
            onChange={setAggregation}
            options={[
              { label: "Nenhuma", value: "none" },
              { label: "Contagem", value: "count" },
              { label: "Soma", value: "sum" },
              { label: "Média", value: "avg" },
              { label: "Mínimo", value: "min" },
              { label: "Máximo", value: "max" },
            ]}
          />
        </Col>
        {aggregation !== "count" && (
          <Col span={16}>
            <label style={labelStyle}>Eixo Y (Valor)</label>
            <Select
              mode={type === "pie" ? undefined : "multiple"}
              placeholder="Selecione as colunas para o eixo Y"
              style={{ width: "100%" }}
              value={type === "pie" ? yKeys[0] : yKeys}
              onChange={(val) => {
                if (Array.isArray(val)) {
                  setYKeys(val);
                } else if (val) {
                  setYKeys([val]);
                } else {
                  setYKeys([]);
                }
              }}
              options={allYOptions}
              maxTagCount="responsive"
            />
          </Col>
        )}
      </Row>

      {/* Chart type + Width */}
      <Row gutter={8}>
        <Col span={12}>
          <label style={labelStyle}>Tipo de Gráfico</label>
          <Select
            style={{ width: "100%" }}
            value={type}
            onChange={setType}
            options={[
              { label: "Barras", value: "bar" },
              { label: "Linha", value: "line" },
              { label: "Pizza", value: "pie" },
            ]}
          />
        </Col>
        <Col span={12}>
          <label style={labelStyle}>Largura</label>
          <Select
            style={{ width: "100%" }}
            value={width}
            onChange={setWidth}
            options={[
              { label: "Tela inteira", value: "full" },
              { label: "Metade", value: "half" },
            ]}
          />
        </Col>
      </Row>

      {/* Sort + Top N + Height */}
      <Row gutter={8}>
        <Col span={10}>
          <label style={labelStyle}>Ordenação</label>
          <Select
            style={{ width: "100%" }}
            value={sortOrder}
            onChange={setSortOrder}
            options={[
              { label: "Nenhuma", value: "none" },
              { label: "Crescente ↑", value: "asc" },
              { label: "Decrescente ↓", value: "desc" },
            ]}
          />
        </Col>
        <Col span={7}>
          <label style={labelStyle}>Top N (0 = todos)</label>
          <InputNumber
            min={0}
            step={1}
            style={{ width: "100%" }}
            value={topN}
            onChange={(val) => setTopN(val ?? 0)}
          />
        </Col>
        <Col span={7}>
          <label style={labelStyle}>Altura (px)</label>
          <InputNumber
            min={200}
            max={1200}
            step={50}
            style={{ width: "100%" }}
            value={height}
            onChange={(val) => setHeight(val ?? 400)}
          />
        </Col>
      </Row>

      {/* Reference line */}
      {type !== "pie" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: referenceLine ? 4 : 0 }}>
            <Switch
              checked={!!referenceLine}
              onChange={(on) => setReferenceLine(on ? { value: 0, label: "" } : undefined)}
              size="small"
            />
            <label
              style={{ cursor: "pointer" }}
              onClick={() => setReferenceLine(referenceLine ? undefined : { value: 0, label: "" })}
            >
              Linha de Referência
            </label>
          </div>
          {referenceLine && (
            <Row gutter={8} style={{ marginTop: 4 }}>
              <Col span={8}>
                <label style={labelStyle}>Valor</label>
                <InputNumber
                  style={{ width: "100%" }}
                  value={referenceLine.value}
                  onChange={(v) => setReferenceLine({ ...referenceLine, value: v ?? 0 })}
                />
              </Col>
              <Col span={16}>
                <label style={labelStyle}>Rótulo (opcional)</label>
                <Input
                  placeholder="ex: Meta"
                  value={referenceLine.label ?? ""}
                  onChange={(e) => setReferenceLine({ ...referenceLine, label: e.target.value })}
                />
              </Col>
            </Row>
          )}
        </div>
      )}

      {/* Show labels toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Switch checked={showLabels} onChange={setShowLabels} size="small" />
        <label style={{ cursor: "pointer" }} onClick={() => setShowLabels(!showLabels)}>
          Rótulos nos dados
        </label>
      </div>
    </Flex>
  );
};
