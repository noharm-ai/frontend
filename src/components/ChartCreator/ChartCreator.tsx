import { useState, useMemo, useCallback, useEffect } from "react";
import { Button, Card, Empty, Modal, Row, Col } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { AggregationType, ChartConfig, ChartCreatorProps, DateGrouping, DerivedColumn, ReferenceLine, SortOrder } from "./types";
import { ChartItem } from "./ChartItem";
import { ChartFormFields } from "./ChartFormFields";

export function ChartCreator({ data, initialCharts, onChartsChange, readOnly }: ChartCreatorProps) {
  const [charts, setCharts] = useState<ChartConfig[]>(initialCharts ?? []);

  useEffect(() => {
    onChartsChange?.(charts);
  }, [charts]); // eslint-disable-line react-hooks/exhaustive-deps

  // State for NEW chart form
  const [newTitle, setNewTitle] = useState("");
  const [newX, setNewX] = useState<string[]>([]);
  const [newY, setNewY] = useState<string[]>([]);
  const [newType, setNewType] = useState<"bar" | "line" | "pie">("bar");
  const [newWidth, setNewWidth] = useState<"full" | "half">("half");
  const [newAggregation, setNewAggregation] = useState<AggregationType>("none");
  const [newSortOrder, setNewSortOrder] = useState<SortOrder>("none");
  const [newTopN, setNewTopN] = useState(0);
  const [newShowLabels, setNewShowLabels] = useState(false);
  const [newHeight, setNewHeight] = useState(400);
  const [newDateGrouping, setNewDateGrouping] = useState<DateGrouping>("none");
  const [newDerivedColumns, setNewDerivedColumns] = useState<DerivedColumn[]>([]);
  const [newReferenceLine, setNewReferenceLine] = useState<ReferenceLine | undefined>(undefined);

  // State for EDITING chart form (Modal)
  const [editTitle, setEditTitle] = useState("");
  const [editX, setEditX] = useState<string[]>([]);
  const [editY, setEditY] = useState<string[]>([]);
  const [editType, setEditType] = useState<"bar" | "line" | "pie">("bar");
  const [editWidth, setEditWidth] = useState<"full" | "half">("full");
  const [editAggregation, setEditAggregation] = useState<AggregationType>("none");
  const [editSortOrder, setEditSortOrder] = useState<SortOrder>("none");
  const [editTopN, setEditTopN] = useState(0);
  const [editShowLabels, setEditShowLabels] = useState(false);
  const [editHeight, setEditHeight] = useState(400);
  const [editDateGrouping, setEditDateGrouping] = useState<DateGrouping>("none");
  const [editDerivedColumns, setEditDerivedColumns] = useState<DerivedColumn[]>([]);
  const [editReferenceLine, setEditReferenceLine] = useState<ReferenceLine | undefined>(undefined);
  const [editingChartId, setEditingChartId] = useState<string | null>(null);

  const keys = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const isNewFormValid =
    newX.length > 0 &&
    (newAggregation === "count" || newY.length > 0) &&
    !!newTitle;

  const isEditFormValid =
    editX.length > 0 &&
    (editAggregation === "count" || editY.length > 0) &&
    !!editTitle;

  const handleAddChart = () => {
    if (isNewFormValid) {
      setCharts((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          type: newType,
          xKeys: newX,
          yKeys: newAggregation === "count" ? [] : newY,
          title: newTitle,
          width: newWidth,
          aggregation: newAggregation,
          sortOrder: newSortOrder,
          topN: newTopN,
          showLabels: newShowLabels,
          height: newHeight,
          dateGrouping: newDateGrouping,
          derivedColumns: newDerivedColumns,
          referenceLine: newReferenceLine,
        },
      ]);
      setNewTitle("");
      setNewX([]);
      setNewY([]);
      setNewType("bar");
      setNewWidth("half");
      setNewAggregation("none");
      setNewSortOrder("none");
      setNewTopN(0);
      setNewShowLabels(false);
      setNewHeight(400);
      setNewDateGrouping("none");
      setNewDerivedColumns([]);
      setNewReferenceLine(undefined);
    }
  };

  const startEditing = useCallback((chart: ChartConfig) => {
    setEditingChartId(chart.id);
    setEditTitle(chart.title);
    setEditX(chart.xKeys);
    setEditY(chart.yKeys);
    setEditType(chart.type);
    setEditWidth(chart.width);
    setEditAggregation(chart.aggregation ?? "none");
    setEditSortOrder(chart.sortOrder ?? "none");
    setEditTopN(chart.topN ?? 0);
    setEditShowLabels(chart.showLabels ?? false);
    setEditHeight(chart.height ?? 400);
    setEditDateGrouping(chart.dateGrouping ?? "none");
    setEditDerivedColumns(chart.derivedColumns ?? []);
    setEditReferenceLine(chart.referenceLine);
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
                yKeys: editAggregation === "count" ? [] : editY,
                type: editType,
                width: editWidth,
                aggregation: editAggregation,
                sortOrder: editSortOrder,
                topN: editTopN,
                showLabels: editShowLabels,
                height: editHeight,
                dateGrouping: editDateGrouping,
                derivedColumns: editDerivedColumns,
                referenceLine: editReferenceLine,
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
            readOnly={readOnly}
          />
        ))}

        {!readOnly && (
          <Col span={12}>
            <Card
              title="Adicionar Novo Gráfico"
              type="inner"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  disabled={!isNewFormValid}
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
                aggregation={newAggregation}
                setAggregation={setNewAggregation}
                sortOrder={newSortOrder}
                setSortOrder={setNewSortOrder}
                topN={newTopN}
                setTopN={setNewTopN}
                showLabels={newShowLabels}
                setShowLabels={setNewShowLabels}
                height={newHeight}
                setHeight={setNewHeight}
                dateGrouping={newDateGrouping}
                setDateGrouping={setNewDateGrouping}
                derivedColumns={newDerivedColumns}
                setDerivedColumns={setNewDerivedColumns}
                referenceLine={newReferenceLine}
                setReferenceLine={setNewReferenceLine}
                keys={keys}
              />
            </Card>
          </Col>
        )}
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
            disabled={!isEditFormValid}
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
          aggregation={editAggregation}
          setAggregation={setEditAggregation}
          sortOrder={editSortOrder}
          setSortOrder={setEditSortOrder}
          topN={editTopN}
          setTopN={setEditTopN}
          showLabels={editShowLabels}
          setShowLabels={setEditShowLabels}
          height={editHeight}
          setHeight={setEditHeight}
          dateGrouping={editDateGrouping}
          setDateGrouping={setEditDateGrouping}
          derivedColumns={editDerivedColumns}
          setDerivedColumns={setEditDerivedColumns}
          referenceLine={editReferenceLine}
          setReferenceLine={setEditReferenceLine}
          keys={keys}
        />
      </Modal>
    </div>
  );
}
