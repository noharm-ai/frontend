import { useTranslation } from "react-i18next";
import { Row, Col } from "antd";

import { SectionHeader } from "styles/Report.style";

import { Indicator } from "../../Indicator/Indicator";
import { Block } from "../../Block/Block";
import { BarChart } from "../../BarChart/BarChart";
import {
  IndicatorGrid,
  Section,
} from "../../InfectionControlConsolidatedReport.style";
import { formatDecimal, formatMedian, formatShare } from "../../format";
import { IConsumption } from "../../infectionControlReportTypes";

interface ConsumptionProps {
  consumption?: IConsumption;
  loading: boolean;
}

/** The length of the courses, route switches, restarts and combinations. */
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
      </IndicatorGrid>

      <Row gutter={[24, 24]}>
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
        </Col>
        <Col xs={24} lg={12}>
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
