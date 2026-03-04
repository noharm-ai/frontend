import { InputNumber, Flex, Input, Select, Switch } from "antd";
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
  <Flex vertical style={{ width: "100%" }} gap="middle">
    <div>
      <label>Título do Gráfico</label>
      <Input
        placeholder="Digite um título para o gráfico"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
    </div>
    <div>
      <label>Eixo X (Categoria)</label>
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
    <div>
      <label>Agregação</label>
      <Select
        placeholder="Selecione o tipo de agregação"
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
    </div>
    {aggregation !== "count" && (
      <div>
        <label>Eixo Y (Valor)</label>
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
      </div>
    )}
    <div>
      <label>Tipo de Gráfico</label>
      <Select
        placeholder="Selecione o tipo de gráfico"
        style={{ width: "100%" }}
        value={type}
        onChange={setType}
        options={[
          { label: "Barras", value: "bar" },
          { label: "Linha", value: "line" },
          { label: "Pizza", value: "pie" },
        ]}
      />
    </div>
    <div>
      <label>Ordenação</label>
      <Select
        style={{ width: "100%" }}
        value={sortOrder}
        onChange={setSortOrder}
        options={[
          { label: "Nenhuma", value: "none" },
          { label: "Crescente (menor → maior)", value: "asc" },
          { label: "Decrescente (maior → menor)", value: "desc" },
        ]}
      />
    </div>
    <div>
      <label>Top N (0 = todos)</label>
      <InputNumber
        min={0}
        step={1}
        style={{ width: "100%" }}
        value={topN}
        onChange={(val) => setTopN(val ?? 0)}
      />
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Switch checked={showLabels} onChange={setShowLabels} />
      <label>Rótulos nos dados</label>
    </div>
    <div>
      <label>Largura do Gráfico</label>
      <Select
        placeholder="Selecione a largura"
        style={{ width: "100%" }}
        value={width}
        onChange={setWidth}
        options={[
          { label: "Tela inteira", value: "full" },
          { label: "Metade da tela", value: "half" },
        ]}
      />
    </div>
    <div>
      <label>Altura (px)</label>
      <InputNumber
        min={200}
        max={1200}
        step={50}
        style={{ width: "100%" }}
        value={height}
        onChange={(val) => setHeight(val ?? 400)}
      />
    </div>
  </Flex>
);
