import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Segmented } from "antd";

import { SectionHeader } from "styles/Report.style";

import { Indicator } from "../../Indicator/Indicator";
import { Block } from "../../Block/Block";
import { RegistryChart } from "../../RegistryChart/RegistryChart";
import { Appropriateness } from "../Appropriateness/Appropriateness";
import {
  IndicatorGrid,
  Section,
} from "../../InfectionControlConsolidatedReport.style";
import { formatInteger, formatShare } from "../../format";
import {
  IAppropriateness,
  IOverview,
  ITrendPoint,
  TrendScale,
} from "../../infectionControlReportTypes";

interface ConformityProps {
  overview?: IOverview;
  appropriateness?: IAppropriateness;
  monthly?: ITrendPoint[];
  daily?: ITrendPoint[];
  loading: boolean;
}

/** The conformity of the period, its antimicrobials by record, by month or day, and its verdicts. */
export function Conformity({
  overview,
  appropriateness,
  monthly,
  daily,
  loading,
}: ConformityProps) {
  const { t } = useTranslation();
  const [scale, setScale] = useState<TrendScale>("month");
  const tk = (key: string) =>
    t(`infectionControlConsolidated.conformity.${key}`);
  const data: Partial<IOverview> = overview || {};

  return (
    <Section>
      <SectionHeader>
        <h2>{tk("title")}</h2>
        <div>{tk("description")}</div>
      </SectionHeader>

      <IndicatorGrid data-kb="reports.infectionControl.overview">
        <Indicator
          title={tk("withRecord")}
          value={formatShare(data.dotWithRecordShare)}
          detail={
            data.dotWithRecord != null &&
            data.dot != null &&
            t("infectionControlConsolidated.conformity.withRecordDetail", {
              recorded: formatInteger(data.dotWithRecord),
              dot: formatInteger(data.dot),
            })
          }
          help={tk("withRecordHelp")}
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
          title={tk("admissionsNonConforming")}
          value={formatInteger(appropriateness?.admissionsWithNonConformity)}
          help={tk("admissionsNonConformingHelp")}
          color="red"
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

      <Appropriateness appropriateness={appropriateness} loading={loading} />
    </Section>
  );
}
