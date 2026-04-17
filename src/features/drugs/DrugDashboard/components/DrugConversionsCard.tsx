import { Alert, Card, Space, Spin, Tag } from "antd";
import { DrugInfoBar, DrugInfoBarItem } from "./DrugInfoBar";
import { EditOutlined } from "@ant-design/icons";

import { formatNumber } from "src/utils/number";
import { useAppDispatch } from "src/store";
import { setDrugUnitConversionOpen } from "features/drugs/DrugUnitConversion/DrugUnitConversionSlice";
import Button from "components/Button";

interface ConversionItem {
  factor: number;
  idMeasureUnit: string;
  name: string;
}

interface DrugConversionsCardProps {
  conversions: ConversionItem[];
  defaultUnit: string | null;
  idDrug: string;
  loading: boolean;
}

export function DrugConversionsCard({
  conversions,
  defaultUnit,
  idDrug,
  loading,
}: DrugConversionsCardProps) {
  const dispatch = useAppDispatch();

  return (
    <Card
      title="Conversões"
      extra={
        <Space>
          <Button
            icon={<EditOutlined />}
            ghost
            type="primary"
            onClick={() =>
              dispatch(
                setDrugUnitConversionOpen({
                  idDrug: idDrug,
                  open: true,
                }),
              )
            }
          >
            Editar conversões
          </Button>
        </Space>
      }
    >
      {!defaultUnit && (
        <Alert
          description="Unidade padrão não definida"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <DrugInfoBar>
        <DrugInfoBarItem label="Unidade padrão:">
          <Tag color={defaultUnit ? "green" : "default"} style={{ margin: 0 }}>
            {defaultUnit ?? "—"}
          </Tag>
        </DrugInfoBarItem>
      </DrugInfoBar>
      <Spin spinning={loading}>
        <div>
          {conversions.map((item, index) => (
            <div
              key={item.idMeasureUnit}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 0",
                borderBottom:
                  index < conversions.length - 1
                    ? "1px solid #f0f0f0"
                    : undefined,
              }}
            >
              <span>
                1 <strong>{item.idMeasureUnit}</strong>
                {item.name ? (
                  <span style={{ color: "#888", marginLeft: 4 }}>
                    ({item.name})
                  </span>
                ) : null}
              </span>
              <span style={{ color: "#888" }}>equivale a</span>
              <span>
                <strong>{formatNumber(item.factor, 4)}</strong>
                {defaultUnit ? (
                  <span style={{ marginLeft: 4 }}>{defaultUnit}</span>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      </Spin>
    </Card>
  );
}
