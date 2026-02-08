import { Space, Input, Select } from "antd";

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
  keys,
}: ChartFormFieldsProps) => (
  <Space direction="vertical" style={{ width: "100%" }} size="middle">
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
  </Space>
);
