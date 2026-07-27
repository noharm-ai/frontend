import { useState, useMemo, useCallback, useEffect, useImperativeHandle } from "react";
import { Button, Card, Empty, Row, Col, Space } from "antd";
import {
  BarChartOutlined,
  BulbOutlined,
  DashboardOutlined,
  FunnelPlotOutlined,
  LineChartOutlined,
  PieChartOutlined,
  RadarChartOutlined,
} from "@ant-design/icons";
import { ChartConfig, ChartCreatorProps } from "./types";
import { ChartItem } from "./ChartItem";
import { ChartWizard } from "./ChartWizard";
import { detectColumnSchema } from "src/utils/dataFilters";

export function ChartCreator({
  data,
  initialCharts,
  onChartsChange,
  readOnly,
  extraActions,
  onGenerateCharts,
  ref,
}: ChartCreatorProps) {
  const [charts, setCharts] = useState<ChartConfig[]>(initialCharts ?? []);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingChart, setEditingChart] = useState<ChartConfig | null>(null);
  const [wizardInitialType, setWizardInitialType] = useState<ChartConfig["type"] | null>(null);
  const [wizardToAgent, setWizardToAgent] = useState(false);

  useEffect(() => {
    onChartsChange?.(charts);
  }, [charts]); // eslint-disable-line react-hooks/exhaustive-deps

  useImperativeHandle(
    ref,
    () => ({
      appendCharts: (newCharts: ChartConfig[]) =>
        setCharts((prev) => [...prev, ...newCharts]),
    }),
    [],
  );

  const schema = useMemo(() => detectColumnSchema(data), [data]);
  const keys = useMemo(() => schema.map((s) => s.key), [schema]);

  const openWithType = (type: ChartConfig["type"]) => {
    setEditingChart(null);
    setWizardInitialType(type);
    setWizardToAgent(false);
    setWizardOpen(true);
  };

  const openAgent = () => {
    setEditingChart(null);
    setWizardInitialType(null);
    setWizardToAgent(true);
    setWizardOpen(true);
  };

  const startEditing = useCallback((chart: ChartConfig) => {
    setEditingChart(chart);
    setWizardInitialType(null);
    setWizardToAgent(false);
    setWizardOpen(true);
  }, []);

  const closeWizard = () => {
    setWizardOpen(false);
    setEditingChart(null);
    setWizardInitialType(null);
    setWizardToAgent(false);
  };

  const handleFinish = (chart: ChartConfig) => {
    setCharts((prev) => {
      const exists = prev.some((c) => c.id === chart.id);
      return exists ? prev.map((c) => (c.id === chart.id ? chart : c)) : [...prev, chart];
    });
    setWizardOpen(false);
    setEditingChart(null);
    setWizardInitialType(null);
    setWizardToAgent(false);
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
            schema={schema}
            onEdit={startEditing}
            onRemove={handleRemoveChart}
            readOnly={readOnly}
          />
        ))}

        {!readOnly && (
          <Col span={12}>
            <Card
              title="Adicionar novo gráfico"
              type="inner"
              extra={<Space>{extraActions}</Space>}
            >
              <div style={{ color: "#888", fontSize: 13, marginBottom: 12 }}>
                Escolha um tipo para começar — o editor abre já configurado, com
                pré-visualização ao vivo.
              </div>
              <Space wrap size={[8, 8]}>
                <Button
                  size="large"
                  icon={<BarChartOutlined />}
                  onClick={() => openWithType("bar")}
                >
                  Barras
                </Button>
                <Button
                  size="large"
                  icon={<BarChartOutlined style={{ transform: "rotate(90deg)" }} />}
                  onClick={() => openWithType("hbar")}
                >
                  Horizontais
                </Button>
                <Button
                  size="large"
                  icon={<LineChartOutlined />}
                  onClick={() => openWithType("line")}
                >
                  Linha
                </Button>
                <Button
                  size="large"
                  icon={<PieChartOutlined />}
                  onClick={() => openWithType("pie")}
                >
                  Pizza
                </Button>
                <Button
                  size="large"
                  icon={<FunnelPlotOutlined />}
                  onClick={() => openWithType("funnel")}
                >
                  Funil
                </Button>
                <Button
                  size="large"
                  icon={<DashboardOutlined />}
                  onClick={() => openWithType("gauge")}
                >
                  Medidor
                </Button>
                <Button
                  size="large"
                  icon={<RadarChartOutlined />}
                  onClick={() => openWithType("radar")}
                >
                  Radar
                </Button>
                {onGenerateCharts && (
                  <Button
                    size="large"
                    type="primary"
                    ghost
                    icon={<BulbOutlined />}
                    onClick={openAgent}
                  >
                    Gerar com agente
                  </Button>
                )}
              </Space>
            </Card>
          </Col>
        )}
      </Row>

      {!readOnly && (
        <ChartWizard
          open={wizardOpen}
          data={data}
          schema={schema}
          keys={keys}
          editingChart={editingChart}
          initialType={wizardInitialType}
          openToAgent={wizardToAgent}
          onCancel={closeWizard}
          onFinish={handleFinish}
          onGenerateCharts={onGenerateCharts}
        />
      )}
    </div>
  );
}
