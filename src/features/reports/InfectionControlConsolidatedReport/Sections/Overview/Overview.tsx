import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Segmented } from "antd";

import { SectionHeader } from "styles/Report.style";

import { Indicator } from "../../Indicator/Indicator";
import { Block } from "../../Block/Block";
import { RegistryChart } from "../../RegistryChart/RegistryChart";
import {
  IndicatorGrid,
  Section,
} from "../../InfectionControlConsolidatedReport.style";
import {
  formatDecimal,
  formatInteger,
  formatMedian,
  formatShare,
} from "../../format";
import {
  IOverview,
  ITrendPoint,
  TrendScale,
} from "../../infectionControlReportTypes";

interface OverviewProps {
  overview?: IOverview;
  monthly?: ITrendPoint[];
  daily?: ITrendPoint[];
  loading: boolean;
}

/** The headline numbers of the period and its antimicrobials by record, by month or day. */
export function Overview({ overview, monthly, daily, loading }: OverviewProps) {
  const { t } = useTranslation();
  const [scale, setScale] = useState<TrendScale>("month");
  const tk = (key: string) => t(`infectionControlConsolidated.overview.${key}`);
  const data: Partial<IOverview> = overview || {};
  const hours = t("infectionControlConsolidated.units.hours");

  return (
    <Section>
      <SectionHeader>
        <h2>{tk("title")}</h2>
        <div>{tk("description")}</div>
      </SectionHeader>

      <IndicatorGrid data-kb="reports.infectionControl.overview">
        <Indicator
          title={tk("dot")}
          value={formatInteger(data.dot)}
          detail={
            data.courses != null &&
            `${formatInteger(data.courses)} ${tk("courses")}`
          }
          help={tk("dotHelp")}
          loading={loading}
        />
        <Indicator
          title={tk("dotPer1000")}
          value={formatDecimal(data.dotPer1000PatientDays)}
          help={tk("dotPer1000Help")}
          loading={loading}
        />
        <Indicator
          title={tk("patientDays")}
          value={formatInteger(data.patientDays)}
          help={tk("patientDaysHelp")}
          loading={loading}
        />
        <Indicator
          title={tk("patients")}
          value={formatInteger(data.patientsOnAntimicrobials)}
          help={tk("patientsHelp")}
          loading={loading}
        />
        <Indicator
          title={tk("lot")}
          value={formatInteger(data.lot)}
          help={tk("lotHelp")}
          loading={loading}
        />
        <Indicator
          title={tk("dotLot")}
          value={formatDecimal(data.dotLot, 2)}
          help={tk("dotLotHelp")}
          loading={loading}
        />
        <Indicator
          title={tk("access")}
          value={formatShare(data.accessShare)}
          help={tk("accessHelp")}
          color="green"
          loading={loading}
        />
        <Indicator
          title={tk("conforming")}
          value={formatShare(data.conformingShare)}
          detail={
            data.evaluations != null &&
            `${formatInteger(data.evaluations)} ${tk("evaluations")}`
          }
          help={tk("conformingHelp")}
          color="green"
          loading={loading}
        />
        <Indicator
          title={tk("d3")}
          value={formatShare(data.evaluatedByD3Share)}
          help={tk("d3Help")}
          color="green"
          loading={loading}
        />
        <Indicator
          title={tk("firstReview")}
          value={formatMedian(data.timeToFirstReviewHours, hours)}
          detail={
            data.timeToFirstReviewHours?.p90 != null &&
            `p90: ${formatDecimal(data.timeToFirstReviewHours.p90)} ${hours}`
          }
          help={tk("firstReviewHelp")}
          color="orange"
          loading={loading}
        />
        <Indicator
          title={tk("acceptance")}
          value={formatShare(data.interventionAcceptance)}
          detail={
            data.interventionsWithOutcome != null &&
            `${formatInteger(data.interventionsWithOutcome)} ${tk("withOutcome")}`
          }
          help={tk("acceptanceHelp")}
          color="orange"
          loading={loading}
        />
        <Indicator
          title={tk("closed")}
          value={formatInteger(data.admissionsClosed)}
          help={tk("closedHelp")}
          loading={loading}
        />
        <Indicator
          title={tk("followed")}
          value={formatInteger(data.admissionsFollowed)}
          help={tk("followedHelp")}
          loading={loading}
        />
      </IndicatorGrid>

      <Block
        title={t("infectionControlConsolidated.registry.title")}
        help={t("infectionControlConsolidated.registry.help")}
        loading={loading}
        kb="reports.infectionControl.registry"
      >
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <Segmented<TrendScale>
            size="small"
            value={scale}
            onChange={setScale}
            options={[
              {
                label: t("infectionControlConsolidated.monthly.month"),
                value: "month",
              },
              {
                label: t("infectionControlConsolidated.monthly.day"),
                value: "day",
              },
            ]}
          />
        </div>
        <RegistryChart
          points={(scale === "month" ? monthly : daily) || []}
          scale={scale}
          loading={loading}
        />
      </Block>
    </Section>
  );
}
