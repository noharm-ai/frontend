import { useState, useMemo, useCallback } from "react";
import { Button, Card, Empty, Modal, Row, Col } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ChartConfig, ChartCreatorProps } from "./types";
import { ChartItem } from "./ChartItem";
import { ChartFormFields } from "./ChartFormFields";

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
