import {
  Alert,
  Card,
  Table,
  Tag,
  Select,
  Spin,
  notification,
  Modal,
  Input,
  Tooltip,
} from "antd";
import type { TableProps } from "antd";
import { ThunderboltOutlined, MessageOutlined } from "@ant-design/icons";
import { useState } from "react";

import { formatNumber } from "src/utils/number";
import { useAppDispatch, useAppSelector } from "store/index";
import { setDrugGenerateScoreOpen } from "src/features/drugs/DrugGenerateScore";
import {
  updateOutlierManualScore,
  updateOutlierObs,
} from "src/features/drugs/DrugDashboard/DrugDashboardSlice";
import Button from "components/Button";
import { formatDateTime } from "src/utils/date";
import { DrugInfoBar, DrugInfoBarItem } from "./DrugInfoBar";

const SCORE_COLOR: Record<number, string> = {
  0: "green",
  1: "yellow",
  2: "orange",
  3: "red",
  4: "purple",
};

const SCORE_OPTIONS = [
  { value: null, label: "—" },
  { value: 0, label: "0" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
];

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
  selected: boolean;
  updatedAt: string;
}

interface DrugOutliersCardProps {
  outliers: OutlierItem[];
  loading: boolean;
  outlierDose?: string;
  outlierFrequency?: string;
}

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

  const [savingId, setSavingId] = useState<number | null>(null);
  const [obsModal, setObsModal] = useState<{
    open: boolean;
    idOutlier: number | null;
    value: string;
  }>({ open: false, idOutlier: null, value: "" });
  const [savingObs, setSavingObs] = useState(false);

  const handleManualScoreChange = async (
    idOutlier: number,
    manualScore: number | null,
  ) => {
    setSavingId(idOutlier);
    const result = await dispatch(
      updateOutlierManualScore({ idOutlier, manualScore }),
    );
    setSavingId(null);
    if (updateOutlierManualScore.rejected.match(result)) {
      notification.error({ message: "Erro ao salvar escore manual." });
    }
  };

  const handleSaveObs = async () => {
    if (obsModal.idOutlier === null) return;
    setSavingObs(true);
    const result = await dispatch(
      updateOutlierObs({ idOutlier: obsModal.idOutlier, obs: obsModal.value }),
    );
    setSavingObs(false);
    if (updateOutlierObs.rejected.match(result)) {
      notification.error({ message: "Erro ao salvar observação." });
    } else {
      setObsModal({ open: false, idOutlier: null, value: "" });
    }
  };

  const columns: TableProps<OutlierItem>["columns"] = [
    {
      title: "Escore",
      dataIndex: "score",
      key: "score",
      width: 90,
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
      width: 140,
      render: (value: number | null, record: OutlierItem) => {
        if (savingId === record.idOutlier) {
          return <Spin size="small" />;
        }

        return (
          <Select
            size="small"
            value={value ?? null}
            style={{ width: 100 }}
            onChange={(val) => handleManualScoreChange(record.idOutlier, val)}
            options={SCORE_OPTIONS.map((opt) => ({
              value: opt.value,
              label:
                opt.value === null ? (
                  <span style={{ color: "#999" }}>{opt.label}</span>
                ) : (
                  <Tag
                    color={SCORE_COLOR[opt.value] ?? "default"}
                    style={{ margin: 0 }}
                  >
                    {opt.label}
                  </Tag>
                ),
            }))}
          />
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
            formatNumber(record.dose - record.divisionRange, 2) +
            "-" +
            formatNumber(record.dose, 2) +
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
      title: (
        <Tooltip title="Contagem" placement="bottom">
          {" "}
          Cont.
        </Tooltip>
      ),
      dataIndex: "countNum",
      key: "countNum",
      align: "right",
      width: 90,
      sorter: (a, b) => a.countNum - b.countNum,
    },
    {
      key: "obs",
      width: 48,
      align: "center",
      render: (_, record: OutlierItem) => (
        <Button
          size="small"
          type="primary"
          ghost={!record.obs}
          icon={<MessageOutlined />}
          onClick={() =>
            setObsModal({
              open: true,
              idOutlier: record.idOutlier,
              value: record.obs ?? "",
            })
          }
        />
      ),
    },
  ];

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
    <Card title="Escores" extra={cardExtra}>
      {!loading && outliers.length === 0 && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          description='Nenhum escore encontrado. Clique em "Gerar escores" para calcular os escores deste medicamento.'
        />
      )}

      <DrugInfoBar>
        {attributes && (
          <>
            <DrugInfoBarItem label="Divisor de faixas:">
              {attributes.divisionRange ? (
                <Tag color="blue" style={{ margin: 0 }}>
                  {formatNumber(attributes.divisionRange, 2)}
                  {attributes.idMeasureUnit
                    ? ` ${attributes.idMeasureUnit}`
                    : ""}
                </Tag>
              ) : (
                <Tag color="default" style={{ margin: 0 }}>
                  Não
                </Tag>
              )}
            </DrugInfoBarItem>
            <DrugInfoBarItem label="Considera peso:">
              <Tag
                color={attributes.useWeight ? "green" : "default"}
                style={{ margin: 0 }}
              >
                {attributes.useWeight ? "Sim" : "Não"}
              </Tag>
            </DrugInfoBarItem>
          </>
        )}

        <DrugInfoBarItem label="Atualizado em:">
          <Tag color="default" style={{ margin: 0 }}>
            {lastUpdatedAt ? formatDateTime(lastUpdatedAt) : "-"}
          </Tag>
        </DrugInfoBarItem>
      </DrugInfoBar>

      <Table
        columns={columns}
        dataSource={outliers}
        rowKey="idOutlier"
        size="small"
        loading={loading}
        pagination={false}
        virtual
        scroll={{ y: TABLE_HEIGHT }}
        onRow={(record) => {
          return record.selected
            ? { style: { background: "rgba(169, 145, 214, 0.2)" } }
            : {};
        }}
      />

      <Modal
        title="Observação"
        open={obsModal.open}
        onCancel={() =>
          setObsModal({ open: false, idOutlier: null, value: "" })
        }
        onOk={handleSaveObs}
        okText="Salvar"
        cancelText="Cancelar"
        confirmLoading={savingObs}
      >
        <Input.TextArea
          rows={4}
          value={obsModal.value}
          onChange={(e) =>
            setObsModal((prev) => ({ ...prev, value: e.target.value }))
          }
        />
      </Modal>
    </Card>
  );
}
