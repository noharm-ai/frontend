import { Card, Table, Tag, Typography } from "antd";
import dayjs from "dayjs";
import type { TableProps } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";

import { formatNumber } from "src/utils/number";
import { useAppDispatch, useAppSelector } from "store/index";
import { setDrugGenerateScoreOpen } from "src/features/drugs/DrugGenerateScore";
import Button from "components/Button";

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
  useWeight: boolean | null;
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
    render: (_, record) => {
      const unit = record.unit || "**";

      if (record.divisionRange) {
        return (
          Number((record.dose - record.divisionRange).toFixed(2)) +
          "-" +
          record.dose +
          " " +
          unit +
          (record.useWeight ? "/Kg" : "")
        );
      } else {
        return `${formatNumber(record.dose, 2)} ${unit}`;
      }
    },
    sorter: (a, b) => a.dose - b.dose,
  },
  {
    title: "Frequência/Dia",
    dataIndex: "frequency",
    key: "frequency",
    align: "right",
    sorter: (a, b) => Number(a.frequency) - Number(b.frequency),
    render: (_, record) =>
      typeof record.frequency === "number"
        ? formatNumber(record.frequency, 3)
        : record.frequency,
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
  const dispatch = useAppDispatch();
  const idDrug = useAppSelector((state: any) => state.drugDashboard.idDrug);
  const idSegment = useAppSelector(
    (state: any) => state.drugDashboard.idSegment,
  );
  const attributes = useAppSelector(
    (state: any) => state.drugDashboard.data?.attributes,
  );
  const substance = useAppSelector(
    (state: any) => state.drugDashboard.data?.substance,
  );

  const lastUpdatedAt = outliers.length
    ? outliers.reduce(
        (max, item) => (item.updatedAt > max ? item.updatedAt : max),
        outliers[0].updatedAt,
      )
    : null;

  const cardExtra = (
    <Button
      icon={<ThunderboltOutlined />}
      ghost
      type="primary"
      onClick={() =>
        dispatch(
          setDrugGenerateScoreOpen({
            open: true,
            idDrug,
            idSegment,
            division: attributes?.divisionRange ?? null,
            useWeight: attributes?.useWeight ?? null,
            idMeasureUnit: attributes?.idMeasureUnit ?? null,
            substance,
          }),
        )
      }
    >
      Gerar escores
    </Button>
  );

  return (
    <Card title="Escores" type="inner" extra={cardExtra}>
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
      {lastUpdatedAt && (
        <Typography.Text
          type="secondary"
          style={{
            fontSize: 12,
            marginTop: 16,
            display: "block",
            textAlign: "center",
          }}
        >
          Última atualização dos escores:{" "}
          {dayjs(lastUpdatedAt).format("DD/MM/YYYY HH:mm")}
        </Typography.Text>
      )}
    </Card>
  );
}
