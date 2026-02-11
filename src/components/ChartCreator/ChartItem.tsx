import { memo, useMemo } from "react";
import { Col, Card, Space, Button } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { EChartBase } from "src/components/EChartBase";
import { ChartConfig } from "./types";
import { getChartOption } from "./utils";

interface ChartItemProps {
  chart: ChartConfig;
  data: any[];
  onEdit: (chart: ChartConfig) => void;
  onRemove: (id: string) => void;
}

export const ChartItem = memo(
  ({ chart, data, onEdit, onRemove }: ChartItemProps) => {
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
