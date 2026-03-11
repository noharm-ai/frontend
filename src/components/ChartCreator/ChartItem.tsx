import { memo, useMemo, useState } from "react";
import { Col, Card, Space, Button, Modal } from "antd";
import { EditOutlined, DeleteOutlined, FullscreenOutlined } from "@ant-design/icons";
import { EChartBase } from "src/components/EChartBase";
import { ChartConfig } from "./types";
import { getChartOption } from "./utils";

interface ChartItemProps {
  chart: ChartConfig;
  data: any[];
  onEdit: (chart: ChartConfig) => void;
  onRemove: (id: string) => void;
  readOnly?: boolean;
}

export const ChartItem = memo(
  ({ chart, data, onEdit, onRemove, readOnly }: ChartItemProps) => {
    const option = useMemo(() => getChartOption(data, chart), [data, chart]);
    const [fullscreen, setFullscreen] = useState(false);

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
      </Col>
    );
  },
);
