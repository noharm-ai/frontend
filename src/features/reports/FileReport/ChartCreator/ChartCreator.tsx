import { useState, useMemo, useCallback, memo } from "react";
import {
  Button,
  Select,
  Card,
  Empty,
  Space,
  FloatButton,
  Modal,
  Input,
  Row,
  Col,
} from "antd";
import { DeleteOutlined, AreaChartOutlined } from "@ant-design/icons";
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
              <Button type="link" onClick={() => onEdit(chart)}>
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

export function ChartCreator({ data }: ChartCreatorProps) {
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [selectedX, setSelectedX] = useState<string[]>([]);
  const [selectedY, setSelectedY] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<"bar" | "line" | "pie">(
    "bar",
  );
  const [selectedWidth, setSelectedWidth] = useState<"full" | "half">("full");
  const [chartTitle, setChartTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChartId, setEditingChartId] = useState<string | null>(null);

  const keys = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const resetForm = () => {
    setSelectedX([]);
    setSelectedY([]);
    setSelectedType("bar");
    setSelectedWidth("full");
    setChartTitle("");
    setEditingChartId(null);
    setIsModalOpen(false);
  };

  const handleAddChart = () => {
    if (
      selectedX.length > 0 &&
      selectedY.length > 0 &&
      selectedType &&
      chartTitle
    ) {
      if (editingChartId) {
        setCharts((prev) =>
          prev.map((c) =>
            c.id === editingChartId
              ? {
                  ...c,
                  type: selectedType,
                  xKeys: selectedX,
                  yKeys: selectedY,
                  title: chartTitle,
                  width: selectedWidth,
                }
              : c,
          ),
        );
      } else {
        setCharts((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substr(2, 9),
            type: selectedType,
            xKeys: selectedX,
            yKeys: selectedY,
            title: chartTitle,
            width: selectedWidth,
          },
        ]);
      }
      resetForm();
    }
  };

  const handleEditChart = useCallback((chart: ChartConfig) => {
    setEditingChartId(chart.id);
    setSelectedX(chart.xKeys);
    setSelectedY(chart.yKeys);
    setSelectedType(chart.type);
    setSelectedWidth(chart.width);
    setChartTitle(chart.title);
    setIsModalOpen(true);
  }, []);

  const handleRemoveChart = useCallback((id: string) => {
    setCharts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  if (!data || data.length === 0)
    return <Empty description="Sem dados para gerar gráficos" />;

  return (
    <div style={{ marginTop: "20px" }}>
      <FloatButton
        icon={<AreaChartOutlined />}
        type="primary"
        style={{ right: 24, bottom: 24 }}
        onClick={() => {
          resetForm();
          setIsModalOpen(true);
        }}
        tooltip="Criar Gráfico"
      />

      <Modal
        title={editingChartId ? "Editar Gráfico" : "Criar Novo Gráfico"}
        open={isModalOpen}
        onCancel={() => resetForm()}
        footer={[
          <Button key="cancel" onClick={() => resetForm()}>
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            disabled={
              selectedX.length === 0 || selectedY.length === 0 || !chartTitle
            }
            onClick={handleAddChart}
          >
            {editingChartId ? "Salvar Alterações" : "Adicionar Gráfico"}
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <div>
            <label>Título do Gráfico</label>
            <Input
              placeholder="Digite um título para o gráfico"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
            />
          </div>
          <div>
            <label>Eixo X (Categoria)</label>
            <Select
              mode="multiple"
              placeholder="Selecione as colunas para o eixo X"
              style={{ width: "100%" }}
              value={selectedX}
              onChange={setSelectedX}
              options={keys.map((k) => ({ label: k, value: k }))}
              maxTagCount="responsive"
            />
          </div>
          <div>
            <label>Eixo Y (Valor)</label>
            <Select
              mode={selectedType === "pie" ? undefined : "multiple"}
              placeholder="Selecione as colunas para o eixo Y"
              style={{ width: "100%" }}
              value={selectedType === "pie" ? selectedY[0] : selectedY}
              onChange={(val) => {
                if (Array.isArray(val)) {
                  setSelectedY(val);
                } else if (val) {
                  setSelectedY([val]);
                } else {
                  setSelectedY([]);
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
              value={selectedType}
              onChange={setSelectedType}
              options={[
                { label: "Barras", value: "bar" },
                { label: "Linha", value: "line" },
                { label: "Pizza", value: "pie" },
              ]}
            />
          </div>
          <div>
            <label>Largura</label>
            <Select
              placeholder="Selecione a largura"
              style={{ width: "100%" }}
              value={selectedWidth}
              onChange={setSelectedWidth}
              options={[
                { label: "Inteira (100%)", value: "full" },
                { label: "Metade (50%)", value: "half" },
              ]}
            />
          </div>
        </Space>
      </Modal>

      <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
        {charts.map((chart) => (
          <ChartItem
            key={chart.id}
            chart={chart}
            data={data}
            onEdit={handleEditChart}
            onRemove={handleRemoveChart}
          />
        ))}
      </Row>
    </div>
  );
}
