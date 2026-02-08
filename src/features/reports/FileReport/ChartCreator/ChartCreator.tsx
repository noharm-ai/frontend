import { useState, useMemo, useCallback, memo } from "react";
import {
  Button,
  Select,
  Card,
  Empty,
  Space,
  Modal,
  Input,
  Row,
  Col,
} from "antd";
import { DeleteOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import { EChartBase } from "src/components/EChartBase";

interface ChartConfig {
  id: string;
  type: "bar" | "line" | "pie";
  xKeys: string[];
  yKeys: string[];
  title: string;
  width: "full" | "half";
}

interface ChartCreatorProps {
  data: any[];
}

const getChartOption = (data: any[], config: ChartConfig) => {
  const xData = data.map((item) =>
    config.xKeys.map((k) => item[k]).join(" - "),
  );

  if (config.type === "pie") {
    const primaryYKey = config.yKeys[0];
    const pieData = data.map((item) => ({
      name: config.xKeys.map((k) => item[k]).join(" - "),
      value: item[primaryYKey],
    }));

    return {
      title: {
        text: config.title,
        left: "center",
      },
      tooltip: {
        trigger: "item",
      },
      toolbox: {
        feature: {
          saveAsImage: { title: "Salvar como Imagem" },
        },
      },
      legend: {
        orient: "vertical",
        left: "left",
      },
      series: [
        {
          name: `${primaryYKey} por ${config.xKeys.join("-")}`,
          type: "pie",
          radius: "50%",
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };
  }

  const series = config.yKeys.map((yKey) => ({
    name: yKey,
    data: data.map((item) => item[yKey]),
    type: config.type,
  }));

  return {
    title: {
      text: config.title,
      left: "center",
    },
    tooltip: {
      trigger: "axis",
    },
    toolbox: {
      feature: {
        saveAsImage: { title: "Salvar como Imagem" },
      },
    },
    legend: {
      data: config.yKeys,
      top: 30, // Adjust legend position to avoid overlap with title
    },
    xAxis: {
      type: "category",
      data: xData,
    },
    yAxis: {
      type: "value",
    },
    series: series,
  };
};

const ChartItem = memo(
  ({
    chart,
    data,
    onEdit,
    onRemove,
  }: {
    chart: ChartConfig;
    data: any[];
    onEdit: (chart: ChartConfig) => void;
    onRemove: (id: string) => void;
  }) => {
    const option = useMemo(() => getChartOption(data, chart), [data, chart]);

    return (
      <Col key={chart.id} span={chart.width === "full" ? 24 : 12}>
        <Card
          title={chart.title}
          type="inner"
          extra={
            <Space>
              <Button
                type="link"
                onClick={() => onEdit(chart)}
                icon={<EditOutlined />}
              >
                Editar
              </Button>
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => onRemove(chart.id)}
              >
                Remover
              </Button>
            </Space>
          }
        >
          <EChartBase
            option={option}
            style={{ height: "400px", width: "100%" }}
            loading={false}
            settings={{}}
            theme={undefined}
            onClick={() => {}}
          />
        </Card>
      </Col>
    );
  },
);

const ChartFormFields = ({
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
}: {
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
}) => (
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

export function ChartCreator({ data }: ChartCreatorProps) {
  const [charts, setCharts] = useState<ChartConfig[]>([]);

  // State for NEW chart form
  const [newTitle, setNewTitle] = useState("");
  const [newX, setNewX] = useState<string[]>([]);
  const [newY, setNewY] = useState<string[]>([]);
  const [newType, setNewType] = useState<"bar" | "line" | "pie">("bar");
  const [newWidth, setNewWidth] = useState<"full" | "half">("half");

  // State for EDITING chart form (Modal)
  const [editTitle, setEditTitle] = useState("");
  const [editX, setEditX] = useState<string[]>([]);
  const [editY, setEditY] = useState<string[]>([]);
  const [editType, setEditType] = useState<"bar" | "line" | "pie">("bar");
  const [editWidth, setEditWidth] = useState<"full" | "half">("full");
  const [editingChartId, setEditingChartId] = useState<string | null>(null);

  const keys = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const handleAddChart = () => {
    if (newX.length > 0 && newY.length > 0 && newType && newTitle) {
      setCharts((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          type: newType,
          xKeys: newX,
          yKeys: newY,
          title: newTitle,
          width: newWidth,
        },
      ]);
      // Reset new form
      setNewTitle("");
      setNewX([]);
      setNewY([]);
      setNewType("bar");
      setNewWidth("half");
    }
  };

  const startEditing = useCallback((chart: ChartConfig) => {
    setEditingChartId(chart.id);
    setEditTitle(chart.title);
    setEditX(chart.xKeys);
    setEditY(chart.yKeys);
    setEditType(chart.type);
    setEditWidth(chart.width);
  }, []);

  const saveEdit = () => {
    if (editingChartId) {
      setCharts((prev) =>
        prev.map((c) =>
          c.id === editingChartId
            ? {
                ...c,
                title: editTitle,
                xKeys: editX,
                yKeys: editY,
                type: editType,
                width: editWidth,
              }
            : c,
        ),
      );
      setEditingChartId(null);
    }
  };

  const handleRemoveChart = useCallback((id: string) => {
    setCharts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  if (!data || data.length === 0)
    return <Empty description="Sem dados para gerar gráficos" />;

  return (
    <div style={{ marginTop: "20px" }}>
      <Row gutter={[16, 16]}>
        {charts.map((chart) => (
          <ChartItem
            key={chart.id}
            chart={chart}
            data={data}
            onEdit={startEditing}
            onRemove={handleRemoveChart}
          />
        ))}

        <Col span={12}>
          <Card
            title="Adicionar Novo Gráfico"
            type="inner"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                disabled={newX.length === 0 || newY.length === 0 || !newTitle}
                onClick={handleAddChart}
              >
                Adicionar
              </Button>
            }
          >
            <ChartFormFields
              title={newTitle}
              setTitle={setNewTitle}
              xKeys={newX}
              setXKeys={setNewX}
              yKeys={newY}
              setYKeys={setNewY}
              type={newType}
              setType={setNewType}
              width={newWidth}
              setWidth={setNewWidth}
              keys={keys}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Editar Gráfico"
        open={!!editingChartId}
        onCancel={() => setEditingChartId(null)}
        footer={[
          <Button key="cancel" onClick={() => setEditingChartId(null)}>
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            disabled={editX.length === 0 || editY.length === 0 || !editTitle}
            onClick={saveEdit}
          >
            Salvar Alterações
          </Button>,
        ]}
      >
        <ChartFormFields
          title={editTitle}
          setTitle={setEditTitle}
          xKeys={editX}
          setXKeys={setEditX}
          yKeys={editY}
          setYKeys={setEditY}
          type={editType}
          setType={setEditType}
          width={editWidth}
          setWidth={setEditWidth}
          keys={keys}
        />
      </Modal>
    </div>
  );
}
