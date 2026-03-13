import { Card, Table, Tag } from "antd";
import type { TableProps } from "antd";
import { formatNumber } from "src/utils/number";

const SCORE_COLOR: Record<number, string> = {
  0: "green",
  1: "yellow",
  2: "orange",
  3: "red",
};

interface OutlierItem {
  idOutlier: number;
  idDrug: number;
  dose: number;
  unit: string;
  frequency: number;
  score: number;
  manualScore: number | null;
  countNum: number;
  divisionRange: number | null;
  obs: string;
  updatedAt: string;
}

interface DrugOutliersCardProps {
  outliers: OutlierItem[];
  loading: boolean;
}

const columns: TableProps<OutlierItem>["columns"] = [
  {
    title: "Escore",
    dataIndex: "score",
    key: "score",
    align: "center",
    sorter: (a, b) => a.score - b.score,
    render: (value: number) => (
      <Tag
        style={{ paddingLeft: "1rem", paddingRight: "1rem" }}
        color={SCORE_COLOR[value] ?? "default"}
      >
        {value}
      </Tag>
    ),
  },
  {
    title: "Escore Manual",
    dataIndex: "manualScore",
    key: "manualScore",
    align: "center",
    render: (value: number) => {
      if (value === null) {
        return "-";
      }

      return (
        <Tag
          style={{ paddingLeft: "1rem", paddingRight: "1rem" }}
          color={SCORE_COLOR[value] ?? "default"}
        >
          {value}
        </Tag>
      );
    },
    sorter: (a, b) =>
      (a.manualScore ?? -Infinity) - (b.manualScore ?? -Infinity),
  },
  {
    title: "Dose",
    key: "dose",
    align: "right",
    render: (_, record) => `${formatNumber(record.dose, 2)} ${record.unit}`,
    sorter: (a, b) => a.dose - b.dose,
  },
  {
    title: "Frequência/Dia",
    dataIndex: "frequency",
    key: "frequency",
    align: "right",
    sorter: (a, b) => a.frequency - b.frequency,
    render: (_, record) => formatNumber(record.frequency, 3),
  },

  {
    title: "Contagem",
    dataIndex: "countNum",
    key: "countNum",
    align: "right",
    sorter: (a, b) => a.countNum - b.countNum,
  },
];

const TABLE_HEIGHT = 400;

export function DrugOutliersCard({ outliers, loading }: DrugOutliersCardProps) {
  return (
    <Card title="Escores" type="inner">
      <Table
        columns={columns}
        dataSource={outliers}
        rowKey="idOutlier"
        size="small"
        loading={loading}
        pagination={false}
        virtual
        scroll={{ y: TABLE_HEIGHT }}
      />
    </Card>
  );
}
