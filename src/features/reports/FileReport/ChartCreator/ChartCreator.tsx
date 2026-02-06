import { useState, useMemo } from "react";
import {
  Button,
  Select,
  Card,
  Empty,
  Space,
  FloatButton,
  Modal,
  Input,
} from "antd";
import { DeleteOutlined, AreaChartOutlined } from "@ant-design/icons";
import { EChartBase } from "src/components/EChartBase";

interface ChartConfig {
  id: string;
  type: "bar" | "line" | "pie";
  xKeys: string[];
  yKeys: string[];
  title: string;
}

interface ChartCreatorProps {
  data: any[];
}

export function ChartCreator({ data }: ChartCreatorProps) {
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [selectedX, setSelectedX] = useState<string[]>([]);
  const [selectedY, setSelectedY] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<"bar" | "line" | "pie">(
    "bar",
  );
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
        setCharts(
          charts.map((c) =>
            c.id === editingChartId
              ? {
                  ...c,
                  type: selectedType,
                  xKeys: selectedX,
                  yKeys: selectedY,
                  title: chartTitle,
                }
              : c,
          ),
        );
      } else {
        setCharts([
          ...charts,
          {
            id: Math.random().toString(36).substr(2, 9),
            type: selectedType,
            xKeys: selectedX,
            yKeys: selectedY,
            title: chartTitle,
          },
        ]);
      }
      resetForm();
    }
  };

  const handleEditChart = (chart: ChartConfig) => {
    setEditingChartId(chart.id);
    setSelectedX(chart.xKeys);
    setSelectedY(chart.yKeys);
    setSelectedType(chart.type);
    setChartTitle(chart.title);
    setIsModalOpen(true);
  };

  const handleRemoveChart = (id: string) => {
    setCharts(charts.filter((c) => c.id !== id));
  };

  const getChartOption = (config: ChartConfig) => {
    const xData = data.map((item) =>
      config.xKeys.map((k) => item[k]).join(" - "),
    );

    if (config.type === "pie") {
      // For Pie charts, we create one series per Y key.
      // To avoid complete overlap, we might need more complex logic,
      // but for now, let's render them. Ideally, Pie charts are best with 1 series.
      // If multiple Ys are present, we might want to suggest Bar/Line, but we honor the request.
      // We will render only the FIRST Y key for Pie to ensure it looks good,
      // as multiple overlapping pies need manual positioning.
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
        </Space>
      </Modal>

      <Space
        direction="vertical"
        style={{ width: "100%", marginTop: "20px" }}
        size="large"
      >
        {charts.map((chart) => (
          <Card
            key={chart.id}
            title={chart.title}
            extra={
              <Space>
                <Button type="link" onClick={() => handleEditChart(chart)}>
                  Editar
                </Button>
                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveChart(chart.id)}
                >
                  Remover
                </Button>
              </Space>
            }
          >
            {/* @ts-expect-error JS component props inference issue */}
            <EChartBase
              option={getChartOption(chart)}
              style={{ height: "400px", width: "100%" }}
              loading={false}
              settings={{}}
              theme={undefined}
              onClick={() => {}}
            />
          </Card>
        ))}
      </Space>
    </div>
  );
}
