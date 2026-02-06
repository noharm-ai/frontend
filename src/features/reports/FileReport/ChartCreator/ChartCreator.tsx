import { useState, useMemo } from "react";
import { Button, Select, Card, Row, Col, Empty, Space } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { EChartBase } from "src/components/EChartBase";

interface ChartConfig {
  id: string;
  type: "bar" | "line" | "pie";
  xKeys: string[];
  yKeys: string[];
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

  const keys = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const handleAddChart = () => {
    if (selectedX.length > 0 && selectedY.length > 0 && selectedType) {
      setCharts([
        ...charts,
        {
          id: Math.random().toString(36).substr(2, 9),
          type: selectedType,
          xKeys: selectedX,
          yKeys: selectedY,
        },
      ]);
      setSelectedX([]);
      setSelectedY([]);
      setSelectedType("bar");
    }
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
        tooltip: {
          trigger: "item",
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
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: config.yKeys,
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
      <Card title="Criar Gráfico" size="small">
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Select
              mode="multiple"
              placeholder="Eixo X (Categoria)"
              style={{ width: "100%" }}
              value={selectedX}
              onChange={setSelectedX}
              options={keys.map((k) => ({ label: k, value: k }))}
              maxTagCount="responsive"
            />
          </Col>
          <Col span={6}>
            <Select
              mode={selectedType === "pie" ? undefined : "multiple"}
              placeholder="Eixo Y (Valor)"
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
          </Col>
          <Col span={6}>
            <Select
              placeholder="Tipo de Gráfico"
              style={{ width: "100%" }}
              value={selectedType}
              onChange={setSelectedType}
              options={[
                { label: "Barras", value: "bar" },
                { label: "Linha", value: "line" },
                { label: "Pizza", value: "pie" },
              ]}
            />
          </Col>
          <Col span={6}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddChart}
              disabled={selectedX.length === 0 || selectedY.length === 0}
              block
            >
              Adicionar
            </Button>
          </Col>
        </Row>
      </Card>

      <Space
        direction="vertical"
        style={{ width: "100%", marginTop: "20px" }}
        size="large"
      >
        {charts.map((chart) => (
          <Card
            key={chart.id}
            title={`${chart.yKeys.join(", ")} por ${chart.xKeys.join(" - ")} (${chart.type})`}
            extra={
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveChart(chart.id)}
              >
                Remover
              </Button>
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
