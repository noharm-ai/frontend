import { useTranslation } from "react-i18next";
import { Row, Col } from "antd";

import { SectionHeader } from "styles/Report.style";

import { Indicator } from "../../Indicator/Indicator";
import { Block } from "../../Block/Block";
import { BarChart } from "../../BarChart/BarChart";
import { PieChart } from "../../PieChart/PieChart";
import {
  BlockHint,
  IndicatorGrid,
  Section,
} from "../../InfectionControlConsolidatedReport.style";
import { formatDecimal, formatInteger, toPercent } from "../../format";
import { AWARE_GROUPS, ROUTE_COLORS, ROUTES } from "../../options";
import { IConsumption, IOverview } from "../../infectionControlReportTypes";

interface DotLotProps {
  overview?: IOverview;
  // the days of therapy by AWaRe group, route and substance
  consumption?: IConsumption;
  loading: boolean;
}

/** Days of therapy and days on antimicrobials of the period, the admissions behind them and the DOT by AWaRe group, route and substance. */
export function DotLot({ overview, consumption, loading }: DotLotProps) {
  const { t } = useTranslation();
  const tk = (key: string) => t(`infectionControlConsolidated.dotLot.${key}`);
  const data: Partial<IOverview> = overview || {};
  const consumed: Partial<IConsumption> = consumption || {};

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
        <Col xs={24} lg={12}>
          <Block
            title={tk("awareMix")}
            help={tk("awareMixHelp")}
            loading={loading}
            kb="reports.infectionControl.awareMix"
          >
            <BlockHint>{tk("awareMixTarget")}</BlockHint>
            <PieChart
              loading={loading}
              slices={AWARE_GROUPS.map((g) => ({
                name: t(`infectionControlConsolidated.aware.${g.key}`),
                value: toPercent(consumed.awareMix?.[g.key]) || 0,
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
                value: toPercent(consumed.routeShare?.[r]) || 0,
                color: ROUTE_COLORS[r],
              }))}
            />
          </Block>
        </Col>
        <Col xs={24}>
          <Block
            title={tk("bySubstance")}
            help={tk("bySubstanceHelp")}
            loading={loading}
            kb="reports.infectionControl.dotBySubstance"
          >
            <BarChart
              horizontal
              loading={loading}
              items={(consumed.dotBySubstance || []).map((s) => ({
                name: s.substance || "-",
                value: s.dot,
              }))}
            />
          </Block>
        </Col>
      </Row>
    </Section>
  );
}
