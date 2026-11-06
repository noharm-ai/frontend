import { useTranslation } from "react-i18next";
import { Row, Col, Table } from "antd";
import type { TableColumnsType } from "antd";

import { SectionHeader } from "styles/Report.style";

import { Indicator } from "../../Indicator/Indicator";
import { Block } from "../../Block/Block";
import { BarChart } from "../../BarChart/BarChart";
import { PieChart } from "../../PieChart/PieChart";
import { UseTrendChart } from "../../UseTrendChart/UseTrendChart";
import { AwareTrendChart } from "../../AwareTrendChart/AwareTrendChart";
import { IndicationTrendChart } from "../../IndicationTrendChart/IndicationTrendChart";
import {
  BlockHint,
  IndicatorGrid,
  Section,
} from "../../InfectionControlConsolidatedReport.style";
import {
  formatDecimal,
  formatInteger,
  formatShare,
  toPercent,
} from "../../format";
import { focusName, shareOf, treatmentTypeName } from "../../indication";
import {
  AWARE_GROUPS,
  ROUTE_COLORS,
  ROUTES,
  TREATMENT_TYPE_GROUPS,
} from "../../options";
import {
  IConsumption,
  IFocusDot,
  IOverview,
  IUsePoint,
} from "../../infectionControlReportTypes";

// a treatment type's days and their AWaRe mix
interface ITypeRow {
  key: string;
  dot: number;
  aware: Record<string, number>;
}

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
  const right = "right" as const;
  const dot = data.dot || 0;

  // the treatment types with days, each with the AWaRe mix of its days
  const typeRows: ITypeRow[] = TREATMENT_TYPE_GROUPS.map((g) => ({
    key: g.key,
    dot: consumed.treatmentTypeDays?.[g.key] || 0,
    aware: consumed.awareByTreatmentType?.[g.key] || {},
  })).filter((row) => row.dot > 0);
  const typeColumns: TableColumnsType<ITypeRow> = [
    {
      title: tk("indication"),
      dataIndex: "key",
      key: "key",
      render: (key: string) => treatmentTypeName(key, t),
    },
    {
      title: tk("indicationDot"),
      dataIndex: "dot",
      key: "dot",
      align: right,
      render: (value: number) => formatInteger(value),
    },
    {
      title: tk("indicationShare"),
      key: "share",
      align: right,
      render: (_: unknown, row: ITypeRow) => formatShare(shareOf(row.dot, dot)),
    },
    ...AWARE_GROUPS.map((g) => ({
      title: `% ${t(`infectionControlConsolidated.aware.${g.key}`)}`,
      key: g.key,
      align: right,
      render: (_: unknown, row: ITypeRow) =>
        formatShare(shareOf(row.aware[g.key], row.dot)),
    })),
  ];

  const focusColumns: TableColumnsType<IFocusDot> = [
    {
      title: tk("focus"),
      dataIndex: "focus",
      key: "focus",
      render: (focus: number) => focusName(focus, t),
    },
    {
      title: tk("indicationDot"),
      dataIndex: "dot",
      key: "dot",
      align: right,
      render: (value: number) => formatInteger(value),
    },
    {
      title: tk("indicationShare"),
      dataIndex: "share",
      key: "share",
      align: right,
      render: (value: number | null) => formatShare(value),
    },
    {
      title: tk("focusSubstances"),
      key: "topSubstances",
      render: (_: unknown, row: IFocusDot) =>
        row.topSubstances
          .map((s) => `${s.substance || "-"} (${formatInteger(s.dot)})`)
          .join(", ") || "-",
    },
  ];

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
        <Indicator
          title={tk("withIndication")}
          value={formatShare(consumed.dotWithTreatmentTypeShare)}
          detail={
            consumed.dotWithTreatmentType != null &&
            data.dot != null &&
            t("infectionControlConsolidated.dotLot.withIndicationDetail", {
              informed: formatInteger(consumed.dotWithTreatmentType),
              dot: formatInteger(data.dot),
            })
          }
          help={tk("withIndicationHelp")}
          kb="reports.infectionControl.withIndication"
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
            title={tk("indicationTrend")}
            help={tk("indicationTrendHelp")}
            loading={loading}
            kb="reports.infectionControl.indicationTrend"
          >
            <IndicationTrendChart points={monthlyUse || []} loading={loading} />
          </Block>
        </Col>
        <Col xs={24}>
          <Block
            title={tk("byIndication")}
            help={tk("byIndicationHelp")}
            loading={loading}
            kb="reports.infectionControl.dotByIndication"
          >
            <Table<ITypeRow>
              columns={typeColumns}
              dataSource={typeRows}
              rowKey={(row: ITypeRow) => row.key}
              pagination={false}
              size="small"
              scroll={{ x: true }}
            />
          </Block>
        </Col>
        <Col xs={24}>
          <Block
            title={tk("byFocus")}
            help={tk("byFocusHelp")}
            loading={loading}
            kb="reports.infectionControl.dotByFocus"
          >
            <BlockHint>
              {t("infectionControlConsolidated.dotLot.byFocusHint", {
                withFocus: formatShare(consumed.dotWithFocusShare),
                multiple: formatShare(consumed.multipleFociShare),
              })}
            </BlockHint>
            <Table<IFocusDot>
              columns={focusColumns}
              dataSource={consumed.dotByFocus || []}
              rowKey={(row: IFocusDot) => `${row.focus}`}
              pagination={{ pageSize: 10, hideOnSinglePage: true }}
              size="small"
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
