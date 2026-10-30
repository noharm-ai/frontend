import { useTranslation } from "react-i18next";
import { Row, Col } from "antd";

import { SectionHeader } from "styles/Report.style";

import { Indicator } from "../../Indicator/Indicator";
import { Block } from "../../Block/Block";
import { BarChart } from "../../BarChart/BarChart";
import { PieChart } from "../../PieChart/PieChart";
import { UseTrendChart } from "../../UseTrendChart/UseTrendChart";
import { AwareTrendChart } from "../../AwareTrendChart/AwareTrendChart";
import {
  BlockHint,
  IndicatorGrid,
  Section,
} from "../../InfectionControlConsolidatedReport.style";
import { formatDecimal, formatInteger, toPercent } from "../../format";
import { AWARE_GROUPS, ROUTE_COLORS, ROUTES } from "../../options";
import {
  IConsumption,
  IOverview,
  IUsePoint,
} from "../../infectionControlReportTypes";

interface DotLotProps {
  overview?: IOverview;
  // the days of therapy by AWaRe group, route and substance
  consumption?: IConsumption;
  monthlyUse?: IUsePoint[];
  loading: boolean;
}

/** Days of therapy and days on antimicrobials of the period, by month, and the DOT by AWaRe group, substance and route. */
export function DotLot({
  overview,
  consumption,
  monthlyUse,
  loading,
}: DotLotProps) {
  const { t } = useTranslation();
  const tk = (key: string) => t(`infectionControlConsolidated.dotLot.${key}`);
  const data: Partial<IOverview> = overview || {};
  const consumed: Partial<IConsumption> = consumption || {};
  const awareColor = Object.fromEntries(
    AWARE_GROUPS.map((g) => [g.key, g.color]),
  );
  // the AWaRe groups among the substances shown, for the bars' legend
  const substanceGroups = AWARE_GROUPS.filter((g) =>
    (consumed.dotBySubstance || []).some((s) => s.aware === g.key),
  );

  return (
    <Section>
      <SectionHeader>
        <h2>{tk("title")}</h2>
        <div>{tk("description")}</div>
      </SectionHeader>

      <IndicatorGrid data-kb="reports.infectionControl.dotLot">
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
          detail={
            data.patientDays != null &&
            t("infectionControlConsolidated.dotLot.patientDaysDetail", {
              patientDays: formatInteger(data.patientDays),
            })
          }
          help={tk("dotPer1000Help")}
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
      </IndicatorGrid>

      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Block
            title={tk("useTrend")}
            help={tk("useTrendHelp")}
            loading={loading}
            kb="reports.infectionControl.useTrend"
          >
            <UseTrendChart points={monthlyUse || []} loading={loading} />
          </Block>
        </Col>
        <Col xs={24}>
          <Block
            title={tk("awareTrend")}
            help={tk("awareTrendHelp")}
            loading={loading}
            kb="reports.infectionControl.awareTrend"
          >
            <BlockHint>{tk("awareMixTarget")}</BlockHint>
            <AwareTrendChart points={monthlyUse || []} loading={loading} />
          </Block>
        </Col>
        <Col xs={24}>
          <Block
            title={tk("bySubstance")}
            help={tk("bySubstanceHelp")}
            loading={loading}
            kb="reports.infectionControl.dotBySubstance"
          >
            <BlockHint>
              {substanceGroups.map((g) => (
                <span key={g.key} style={{ marginRight: 12 }}>
                  <span style={{ color: g.color }}>■</span>{" "}
                  {t(`infectionControlConsolidated.aware.${g.key}`)}
                </span>
              ))}
            </BlockHint>
            <BarChart
              horizontal
              loading={loading}
              items={(consumed.dotBySubstance || []).map((s) => ({
                name: s.substance || "-",
                value: s.dot,
                color: awareColor[s.aware],
              }))}
            />
          </Block>
        </Col>
        <Col xs={24} lg={12}>
          <Block
            title={tk("route")}
            help={tk("routeHelp")}
            loading={loading}
            kb="reports.infectionControl.route"
          >
            <PieChart
              loading={loading}
              slices={ROUTES.map((r) => ({
                name: t(`infectionControlConsolidated.route.${r}`),
                value: toPercent(consumed.routeShare?.[r]) || 0,
                color: ROUTE_COLORS[r],
              }))}
            />
          </Block>
        </Col>
      </Row>
    </Section>
  );
}
