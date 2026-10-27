import { useTranslation } from "react-i18next";
import { Row, Col, Table } from "antd";
import type { TableColumnsType } from "antd";

import { SectionHeader } from "styles/Report.style";
import { FeatureService } from "services/FeatureService";
import Feature from "models/Feature";
import { maskedName } from "utils/report";

import { Indicator } from "../../Indicator/Indicator";
import { Block } from "../../Block/Block";
import { BarChart } from "../../BarChart/BarChart";
import { IndicatorGrid } from "../../InfectionControlConsolidatedReport.style";
import {
  formatDecimal,
  formatInteger,
  formatMedian,
  formatShare,
} from "../../format";
import {
  IPendingRow,
  IProcess,
  IQuantiles,
  IReviewerRow,
} from "../../infectionControlReportTypes";

interface ProcessProps {
  process?: IProcess;
  loading: boolean;
}

/** How the team follows the admissions: coverage, timeliness, pending reasons and reviewers. */
export function Process({ process, loading }: ProcessProps) {
  const { t } = useTranslation();
  const tk = (key: string) => t(`infectionControlConsolidated.process.${key}`);
  const data: Partial<IProcess> = process || {};
  const hours = t("infectionControlConsolidated.units.hours");
  const hideNames = FeatureService.has(Feature.HIDE_NAMES);
  const right = "right" as const;

  const pendingColumns: TableColumnsType<IPendingRow> = [
    {
      title: tk("pendingType"),
      dataIndex: "type",
      key: "type",
      render: (type: number) =>
        t(`infectionControl.worklist.pendingType.${type}`, `${type}`),
    },
    {
      title: tk("opened"),
      dataIndex: "opened",
      key: "opened",
      align: right,
      render: (value: number) => formatInteger(value),
    },
    {
      title: tk("stillOpen"),
      dataIndex: "stillOpen",
      key: "stillOpen",
      align: right,
      render: (value: number) => formatInteger(value),
    },
    {
      title: tk("hoursOpen"),
      dataIndex: "hoursOpen",
      key: "hoursOpen",
      align: right,
      render: (value: IQuantiles) => formatDecimal(value?.median),
    },
    {
      title: tk("byTeam"),
      dataIndex: "resolvedByTeamShare",
      key: "resolvedByTeamShare",
      align: right,
      render: (value: number) => formatShare(value),
    },
  ];

  const reviewerColumns: TableColumnsType<IReviewerRow> = [
    {
      title: tk("reviewer"),
      dataIndex: "reviewer",
      key: "reviewer",
      render: (name: string, _row: IReviewerRow, index: number) =>
        hideNames ? maskedName(index) : name || "-",
    },
    {
      title: tk("evaluations"),
      dataIndex: "evaluations",
      key: "evaluations",
      align: right,
      sorter: (a: IReviewerRow, b: IReviewerRow) =>
        a.evaluations - b.evaluations,
      defaultSortOrder: "descend" as const,
    },
    {
      title: tk("admissions"),
      dataIndex: "admissions",
      key: "admissions",
      align: right,
      sorter: (a: IReviewerRow, b: IReviewerRow) => a.admissions - b.admissions,
    },
    {
      title: tk("nonConforming"),
      dataIndex: "nonConformingShare",
      key: "nonConformingShare",
      align: right,
      render: (value: number) => formatShare(value),
    },
  ];

  return (
    <>
      <SectionHeader>
        <h2>{tk("title")}</h2>
        <div>{tk("description")}</div>
      </SectionHeader>

      <IndicatorGrid data-kb="reports.infectionControl.process">
        <Indicator
          title={tk("reviewed")}
          value={formatShare(data.admissionsReviewedShare)}
          help={tk("reviewedHelp")}
          loading={loading}
        />
        <Indicator
          title={tk("evaluated")}
          value={formatShare(data.coursesEvaluatedShare)}
          help={tk("evaluatedHelp")}
          loading={loading}
        />
        <Indicator
          title={tk("reviewsPerAdmission")}
          value={formatDecimal(data.reviewsPerAdmission)}
          help={tk("reviewsPerAdmissionHelp")}
          loading={loading}
        />
        <Indicator
          title={tk("reviewsPer100Dot")}
          value={formatDecimal(data.reviewsPer100Dot)}
          help={tk("reviewsPer100DotHelp")}
          loading={loading}
        />
        <Indicator
          title={tk("interval")}
          value={formatMedian(data.reviewIntervalHours, hours)}
          help={tk("intervalHelp")}
          color="orange"
          loading={loading}
        />
        <Indicator
          title={tk("firstEvaluation")}
          value={formatMedian(data.timeToFirstEvaluationHours, hours)}
          help={tk("firstEvaluationHelp")}
          color="orange"
          loading={loading}
        />
        <Indicator
          title={tk("pendingTime")}
          value={formatShare(data.pendingTimeShare)}
          help={tk("pendingTimeHelp")}
          color="orange"
          loading={loading}
        />
        <Indicator
          title={tk("retroactive")}
          value={formatShare(data.retroactiveShare)}
          help={tk("retroactiveHelp")}
          color="orange"
          loading={loading}
        />
      </IndicatorGrid>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Block
            title={tk("firstReviewBins")}
            help={tk("firstReviewBinsHelp")}
            loading={loading}
            kb="reports.infectionControl.firstReview"
          >
            <BarChart
              loading={loading}
              items={(data.timeToFirstReviewBins || []).map((b) => ({
                name: b.label,
                value: b.count,
              }))}
            />
          </Block>
        </Col>
        <Col xs={24} lg={12}>
          <Block
            title={tk("pendings")}
            help={tk("pendingsHelp")}
            loading={loading}
            kb="reports.infectionControl.pendings"
          >
            <Table<IPendingRow>
              columns={pendingColumns}
              dataSource={data.pendings || []}
              rowKey={(row: IPendingRow) => `${row.type}`}
              pagination={false}
              size="small"
            />
          </Block>
        </Col>
        <Col xs={24}>
          <Block
            title={tk("reviewers")}
            help={tk("reviewersHelp")}
            loading={loading}
            kb="reports.infectionControl.reviewers"
          >
            <Table<IReviewerRow>
              columns={reviewerColumns}
              dataSource={data.reviewers || []}
              rowKey={(row: IReviewerRow) => `${row.idReviewer}`}
              pagination={false}
              size="small"
            />
          </Block>
        </Col>
      </Row>
    </>
  );
}
