import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs, { Dayjs } from "dayjs";
import { Row, Col, Alert, Table } from "antd";
import type { TableColumnsType } from "antd";

import { useAppDispatch, useAppSelector } from "src/store";
import { DatePicker } from "components/Inputs";
import { SectionHeader } from "styles/Report.style";

import { fetchDayData } from "../InfectionControlConsolidatedReportSlice";
import { Indicator } from "../Indicator/Indicator";
import { Block } from "../Block/Block";
import { BarChart } from "../BarChart/BarChart";
import {
  DayHeader,
  IndicatorGrid,
} from "../InfectionControlConsolidatedReport.style";
import { formatInteger } from "../format";
import { REGISTRY_STATUSES } from "../options";
import { IDayDepartment, IDayView } from "../infectionControlReportTypes";

interface DayViewProps {
  // the filters applied to the report, without the period
  filters: Record<string, unknown> | null;
}

/**
 * The antimicrobials prescribed on one day (yesterday by default, the last day
 * the files are complete) and whether each had a valid conformity record on it.
 */
export function DayView({ filters }: DayViewProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [day, setDay] = useState<Dayjs>(dayjs().subtract(1, "day"));
  const status = useAppSelector(
    (state) => state.reportsArea.infectionControlConsolidated.day.status,
  );
  const result = useAppSelector(
    (state) => state.reportsArea.infectionControlConsolidated.day.result,
  );
  const loading = status === "loading";
  const data: Partial<IDayView> = result?.day || {};
  const tk = (key: string) => t(`infectionControlConsolidated.day.${key}`);

  const error = useAppSelector(
    (state) => state.reportsArea.infectionControlConsolidated.day.error,
  );

  // a failure shows in the section (the period already notifies its own)
  useEffect(() => {
    if (!filters) return;

    dispatch(
      fetchDayData({
        ...filters,
        year: day.year(),
        day: day.format("YYYY-MM-DD"),
      }),
    );
  }, [day, filters, dispatch]);

  const columns: TableColumnsType<IDayDepartment> = [
    {
      title: t("infectionControlConsolidated.departments.department"),
      dataIndex: "department",
      key: "department",
    },
    {
      title: tk("prescribed"),
      dataIndex: "prescribed",
      key: "prescribed",
      align: "right" as const,
    },
    ...REGISTRY_STATUSES.map((s) => ({
      title: t(`infectionControlConsolidated.status.${s}`),
      dataIndex: s,
      key: s,
      align: "right" as const,
    })),
  ];

  return (
    <>
      <DayHeader>
        <SectionHeader>
          <h2>{tk("title")}</h2>
          <div>{tk("description")}</div>
        </SectionHeader>
        <div className="day-picker">
          <label htmlFor="infection-control-day">{tk("date")}:</label>
          <DatePicker
            id="infection-control-day"
            format="DD/MM/YYYY"
            value={day}
            allowClear={false}
            disabledDate={(d: Dayjs) => d.isAfter(dayjs(), "day")}
            onChange={(value: Dayjs | null) => value && setDay(value)}
          />
        </div>
      </DayHeader>

      {status === "failed" && (
        <Alert
          type="error"
          showIcon
          title={t("infectionControlConsolidated.loadError")}
          description={
            error || t("infectionControlConsolidated.unexpectedError")
          }
        />
      )}

      <IndicatorGrid data-kb="reports.infectionControl.day">
        <Indicator
          title={tk("prescribed")}
          value={formatInteger(data.prescribed)}
          detail={
            data.patients != null &&
            `${formatInteger(data.patients)} ${tk("patients")}`
          }
          help={tk("prescribedHelp")}
          loading={loading}
        />
        <Indicator
          title={tk("withRecord")}
          value={formatInteger(data.withRecord)}
          detail={
            data.withRecord != null &&
            `${formatInteger(data.conforming)} ${tk("conformingDetail")} · ${formatInteger(data.nonConforming)} ${tk("nonConformingDetail")}`
          }
          help={tk("withRecordHelp")}
          color="green"
          loading={loading}
        />
        <Indicator
          title={tk("withoutRecord")}
          value={formatInteger(data.withoutRecord)}
          detail={
            data.withoutRecord != null &&
            `${formatInteger(data.notEvaluated)} ${tk("notEvaluatedDetail")} · ${formatInteger(data.expired)} ${tk("expiredDetail")}`
          }
          help={tk("withoutRecordHelp")}
          color="orange"
          loading={loading}
        />
        <Indicator
          title={tk("pastD3")}
          value={formatInteger(data.withoutRecordPastD3)}
          help={tk("pastD3Help")}
          color="red"
          loading={loading}
        />
      </IndicatorGrid>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Block
            title={tk("reasons")}
            help={tk("reasonsHelp")}
            loading={loading}
            kb="reports.infectionControl.dayReasons"
          >
            <BarChart
              horizontal
              color="#e6744e"
              loading={loading}
              items={(data.nonConformityReasons || []).map((r) => ({
                name: r.reason,
                value: r.count,
              }))}
            />
          </Block>
        </Col>
        <Col xs={24} lg={12}>
          <Block
            title={tk("byDepartment")}
            help={tk("byDepartmentHelp")}
            loading={loading}
            kb="reports.infectionControl.dayDepartments"
          >
            <Table<IDayDepartment>
              columns={columns}
              dataSource={data.byDepartment || []}
              rowKey={(row: IDayDepartment) => `${row.idDepartment}`}
              pagination={false}
              size="small"
            />
          </Block>
        </Col>
      </Row>
    </>
  );
}
