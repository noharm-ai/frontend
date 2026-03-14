import { Alert, Card, Space, Table, Tag } from "antd";
import type { TableProps } from "antd";
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
  idDrug: number;
  loading: boolean;
}

const columns: TableProps<ConversionItem>["columns"] = [
  {
    title: "Unidade",
    dataIndex: "idMeasureUnit",
    key: "idMeasureUnit",
  },
  {
    title: "Nome",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Fator",
    dataIndex: "factor",
    key: "factor",
    align: "right",
    render: (value: number) => formatNumber(value, 2),
  },
];

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
      type="inner"
      extra={
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() =>
              dispatch(
                setDrugUnitConversionOpen({
                  idDrug: String(idDrug),
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
      {defaultUnit && (
        <div style={{ marginBottom: 16 }}>
          Unidade padrão:{" "}
          <Tag color="green" variant="outlined">
            {defaultUnit}
          </Tag>
        </div>
      )}
      <Table
        columns={columns}
        dataSource={conversions}
        rowKey="idMeasureUnit"
        size="small"
        loading={loading}
        pagination={false}
      />
    </Card>
  );
}
