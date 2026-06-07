import { memo, useMemo, useState } from "react";
import { Badge, Col, Card, Space, Button, Modal } from "antd";
import { EditOutlined, DeleteOutlined, FilterOutlined, FullscreenOutlined } from "@ant-design/icons";
import { EChartBase } from "src/components/EChartBase";
import { ChartConfig, ColumnSchema } from "./types";
import { getChartOption } from "./utils";
import { applyFilters } from "src/utils/dataFilters";
import { ChartFilterPanel } from "./ChartFilterPanel";

interface ChartItemProps {
  chart: ChartConfig;
  data: any[];
  schema: ColumnSchema[];
  onEdit: (chart: ChartConfig) => void;
  onRemove: (id: string) => void;
  readOnly?: boolean;
}

export const ChartItem = memo(
  ({ chart, data, schema, onEdit, onRemove, readOnly }: ChartItemProps) => {
    const filteredData = useMemo(
      () => applyFilters(data, chart.filters ?? [], schema),
      [data, chart.filters, schema],
    );
    const option = useMemo(() => getChartOption(filteredData, chart), [filteredData, chart]);
    const [fullscreen, setFullscreen] = useState(false);
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const activeFilterCount = chart.filters?.length ?? 0;

    return (
      <Col key={chart.id} span={chart.width === "full" ? 24 : 12}>
        <Card
          title={chart.title}
          type="inner"
          extra={
            <Space>
              <Button
                type="text"
                icon={<FullscreenOutlined />}
                onClick={() => setFullscreen(true)}
              />
              {readOnly && activeFilterCount > 0 && (
                <Badge count={activeFilterCount} size="small">
                  <Button
                    type="text"
                    icon={<FilterOutlined />}
                    onClick={() => setFilterModalOpen(true)}
                  >
                    Filtros
                  </Button>
                </Badge>
              )}
              {!readOnly && (
                <>
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
                </>
              )}
            </Space>
          }
        >
          <EChartBase
            option={option}
            style={{ height: `${chart.height ?? 400}px`, width: "100%" }}
            loading={false}
            settings={{}}
            theme={undefined}
            onClick={() => {}}
          />
        </Card>

        <Modal
          open={fullscreen}
          onCancel={() => setFullscreen(false)}
          footer={null}
          title={chart.title}
          width="100vw"
          style={{ top: 0, padding: 0, maxWidth: "100vw" }}
          styles={{ body: { height: "calc(100vh - 55px)", padding: 8 } }}
          destroyOnHidden
        >
          <EChartBase
            option={option}
            style={{ height: "100%", width: "100%" }}
            loading={false}
            settings={{}}
            theme={undefined}
            onClick={() => {}}
          />
        </Modal>

        <Modal
          open={filterModalOpen}
          onCancel={() => setFilterModalOpen(false)}
          footer={null}
          title="Filtros aplicados"
        >
          <ChartFilterPanel
            filters={chart.filters ?? []}
            schema={schema}
            readOnly={true}
            onChange={() => {}}
          />
        </Modal>
      </Col>
    );
  },
);
