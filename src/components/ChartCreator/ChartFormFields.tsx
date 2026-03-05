import { InputNumber, Flex, Input, Select, Switch, Row, Col } from "antd";
import { AggregationType, SortOrder } from "./types";

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
  keys: string[];
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  color: "#888",
  marginBottom: 2,
};

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
  keys,
}: ChartFormFieldsProps) => (
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

    {/* X axis */}
    <div>
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
            options={keys.map((k) => ({ label: k, value: k }))}
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

    {/* Show labels toggle */}
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Switch checked={showLabels} onChange={setShowLabels} size="small" />
      <label style={{ cursor: "pointer" }} onClick={() => setShowLabels(!showLabels)}>
        Rótulos nos dados
      </label>
    </div>
  </Flex>
);
