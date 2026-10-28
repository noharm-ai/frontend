import { useTranslation } from "react-i18next";
import { Row, Col } from "antd";

import { SectionHeader } from "styles/Report.style";

import { Indicator } from "../../Indicator/Indicator";
import { Block } from "../../Block/Block";
import { BarChart } from "../../BarChart/BarChart";
import { PieChart } from "../../PieChart/PieChart";
import {
  IndicatorGrid,
  Section,
} from "../../InfectionControlConsolidatedReport.style";
import {
  formatDecimal,
  formatMedian,
  formatShare,
  toPercent,
} from "../../format";
import { AWARE_GROUPS, ROUTE_COLORS, ROUTES } from "../../options";
import { IConsumption } from "../../infectionControlReportTypes";

interface ConsumptionProps {
  consumption?: IConsumption;
  loading: boolean;
}

/** Days of therapy by AWaRe group, substance and route, and the length of the courses. */
export function Consumption({ consumption, loading }: ConsumptionProps) {
  const { t } = useTranslation();
  const tk = (key: string) =>
    t(`infectionControlConsolidated.consumption.${key}`);
  const data: Partial<IConsumption> = consumption || {};
  const days = t("infectionControlConsolidated.units.days");

  return (
    <Section>
      <SectionHeader>
        <h2>{tk("title")}</h2>
        <div>{tk("description")}</div>
      </SectionHeader>

      <IndicatorGrid data-kb="reports.infectionControl.consumption">
        <Indicator
          title={tk("courseLength")}
          value={formatMedian(data.courseLengthDays, days)}
          detail={
            data.courseLengthDays?.p90 != null &&
            `p90: ${formatDecimal(data.courseLengthDays.p90)} ${days}`
          }
          help={tk("courseLengthHelp")}
          loading={loading}
        />
        <Indicator
          title={tk("pastPlanned")}
          value={formatShare(data.pastPlannedEndShare)}
          help={tk("pastPlannedHelp")}
          color="orange"
          loading={loading}
        />
        <Indicator
          title={tk("ivToOral")}
          value={formatShare(data.ivToOralSwitchShare)}
          help={tk("ivToOralHelp")}
          color="green"
          loading={loading}
        />
        <Indicator
          title={tk("ivToOralDay")}
          value={
            data.ivToOralSwitchDay?.median == null
              ? "-"
              : `D${formatDecimal(data.ivToOralSwitchDay.median)}`
          }
          help={tk("ivToOralDayHelp")}
          color="green"
          loading={loading}
        />
        <Indicator
          title={tk("restart")}
          value={formatShare(data.restartShare)}
          help={tk("restartHelp")}
          color="orange"
          loading={loading}
        />
        <Indicator
          title={tk("episodes")}
          value={formatDecimal(data.episodesPerAdmission, 2)}
          help={tk("episodesHelp")}
          loading={loading}
        />
      </IndicatorGrid>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Block
            title={tk("awareMix")}
            help={tk("awareMixHelp")}
            loading={loading}
            kb="reports.infectionControl.awareMix"
          >
            <PieChart
              loading={loading}
              slices={AWARE_GROUPS.map((g) => ({
                name: t(`infectionControlConsolidated.aware.${g.key}`),
                value: toPercent(data.awareMix?.[g.key]) || 0,
                color: g.color,
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
                value: toPercent(data.routeShare?.[r]) || 0,
                color: ROUTE_COLORS[r],
              }))}
            />
          </Block>
        </Col>
        <Col xs={24} lg={12}>
          <Block
            title={tk("bySubstance")}
            help={tk("bySubstanceHelp")}
            loading={loading}
            kb="reports.infectionControl.dotBySubstance"
          >
            <BarChart
              horizontal
              loading={loading}
              items={(data.dotBySubstance || []).map((s) => ({
                name: s.substance || "-",
                value: s.dot,
              }))}
            />
          </Block>
        </Col>
        <Col xs={24} lg={12}>
          <Block
            title={tk("courseLengthBins")}
            help={tk("courseLengthBinsHelp")}
            loading={loading}
            kb="reports.infectionControl.courseLength"
          >
            <BarChart
              loading={loading}
              items={(data.courseLengthBins || []).map((b) => ({
                name: b.label,
                value: b.count,
              }))}
            />
          </Block>
          <div style={{ height: 24 }} />
          <Block
            title={tk("maxSimultaneous")}
            help={tk("maxSimultaneousHelp")}
            loading={loading}
            kb="reports.infectionControl.simultaneous"
          >
            <BarChart
              loading={loading}
              items={Object.entries(data.maxSimultaneous || {}).map(
                ([count, admissions]) => ({
                  name: count,
                  value: admissions,
                }),
              )}
            />
          </Block>
        </Col>
      </Row>
    </Section>
  );
}
