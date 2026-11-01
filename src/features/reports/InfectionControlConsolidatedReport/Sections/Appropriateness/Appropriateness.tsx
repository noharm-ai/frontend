import { useTranslation } from "react-i18next";
import { Row, Col, Table } from "antd";
import type { TableColumnsType } from "antd";

import { Block } from "../../Block/Block";
import { BarChart } from "../../BarChart/BarChart";
import { PieChart } from "../../PieChart/PieChart";
import { formatDecimal, formatInteger, formatShare } from "../../format";
import {
  IAppropriateness,
  ISubstanceEvaluations,
  ISubstitution,
} from "../../infectionControlReportTypes";

interface AppropriatenessProps {
  appropriateness?: IAppropriateness;
  loading: boolean;
}

/** The verdict blocks of the conformity section: non-conformity reasons, substitutions, intervention outcomes and evaluations by substance. */
export function Appropriateness({
  appropriateness,
  loading,
}: AppropriatenessProps) {
  const { t } = useTranslation();
  const tk = (key: string) =>
    t(`infectionControlConsolidated.appropriateness.${key}`);
  const data: Partial<IAppropriateness> = appropriateness || {};
  const interventions: Partial<IAppropriateness["interventions"]> =
    data.interventions || {};
  const right = "right" as const;

  const substanceColumns: TableColumnsType<ISubstanceEvaluations> = [
    { title: tk("substance"), dataIndex: "substance", key: "substance" },
    {
      title: tk("evaluations"),
      dataIndex: "evaluations",
      key: "evaluations",
      align: right,
    },
    {
      title: tk("conforming"),
      dataIndex: "conformingShare",
      key: "conformingShare",
      align: right,
      render: (value: number) => formatShare(value),
    },
  ];

  const substitutionColumns: TableColumnsType<ISubstitution> = [
    { title: tk("from"), dataIndex: "from", key: "from" },
    { title: tk("to"), dataIndex: "to", key: "to" },
    {
      title: tk("type"),
      dataIndex: "type",
      key: "type",
      render: (type: string | null) =>
        type ? t(`infectionControlConsolidated.adjustment.${type}`) : "-",
    },
    { title: tk("count"), dataIndex: "count", key: "count", align: right },
  ];

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={12}>
        <Block
          title={tk("reasons")}
          help={tk("reasonsHelp")}
          loading={loading}
          kb="reports.infectionControl.reasons"
        >
          <BarChart
            horizontal
            color="#e6744e"
            loading={loading}
            items={(data.reasons || []).map((r) => ({
              name: r.reason,
              value: r.count,
            }))}
          />
        </Block>
      </Col>
      <Col xs={24} lg={12}>
        <Block
          title={tk("substitutions")}
          help={tk("substitutionsHelp")}
          loading={loading}
          kb="reports.infectionControl.substitutions"
        >
          <Table<ISubstitution>
            columns={substitutionColumns}
            dataSource={data.substitutions || []}
            rowKey={(row: ISubstitution) => `${row.from}-${row.to}-${row.type}`}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            size="small"
          />
        </Block>
      </Col>
      <Col xs={24} lg={12}>
        <Block
          title={tk("interventions")}
          help={tk("interventionsHelp")}
          loading={loading}
          kb="reports.infectionControl.interventions"
        >
          <div style={{ textAlign: "center" }}>
            {formatInteger(interventions.recorded)} {tk("recorded")} ·{" "}
            {tk("hoursToOutcome")}:{" "}
            {formatDecimal(interventions.hoursToOutcome?.median)}
          </div>
          <PieChart
            loading={loading}
            slices={Object.entries(interventions.byStatus || {}).map(
              ([status, count]) => ({
                name: t(`interventionStatus.${status}`, status),
                value: count,
              }),
            )}
          />
        </Block>
      </Col>
      <Col xs={24}>
        <Block
          title={tk("bySubstance")}
          help={tk("bySubstanceHelp")}
          loading={loading}
          kb="reports.infectionControl.evaluationsBySubstance"
        >
          <Table<ISubstanceEvaluations>
            columns={substanceColumns}
            dataSource={data.bySubstance || []}
            rowKey={(row: ISubstanceEvaluations) => `${row.idSubstance}`}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            size="small"
          />
        </Block>
      </Col>
    </Row>
  );
}
