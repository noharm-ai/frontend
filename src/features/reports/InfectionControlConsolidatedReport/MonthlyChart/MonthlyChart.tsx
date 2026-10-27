import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import { EChartBase } from "components/EChartBase";
import Empty from "components/Empty";

import { toPercent } from "../format";
import { IMonth } from "../infectionControlReportTypes";

interface MonthlyChartProps {
  months: IMonth[];
  loading?: boolean;
}

/** DOT by month (bars) with the conformity and D3 time-out shares (lines). */
export function MonthlyChart({ months, loading = false }: MonthlyChartProps) {
  const { t } = useTranslation();

  if (!loading && months.length === 0) {
    return <Empty description={t("infectionControlConsolidated.noData")} />;
  }

  const option = {
    tooltip: { trigger: "axis" },
    legend: {},
    grid: { left: 50, right: 50, top: 40, bottom: 30 },
    toolbox: {
      feature: {
        saveAsImage: { title: t("infectionControlConsolidated.saveAsImage") },
      },
    },
    xAxis: {
      type: "category",
      data: months.map((m) => dayjs(`${m.month}-01`).format("MM/YYYY")),
    },
    yAxis: [
      { type: "value", name: t("infectionControlConsolidated.monthly.dot") },
      {
        type: "value",
        min: 0,
        max: 100,
        axisLabel: { formatter: "{value}%" },
      },
    ],
    series: [
      {
        name: t("infectionControlConsolidated.monthly.dot"),
        type: "bar",
        data: months.map((m) => m.dot),
        itemStyle: { color: "#90caf9", borderRadius: [4, 4, 0, 0] },
      },
      {
        name: t("infectionControlConsolidated.monthly.conforming"),
        type: "line",
        yAxisIndex: 1,
        data: months.map((m) => toPercent(m.conformingShare)),
        itemStyle: { color: "#388e3c" },
        tooltip: { valueFormatter: (v: number) => (v == null ? "-" : `${v}%`) },
      },
      {
        name: t("infectionControlConsolidated.monthly.d3"),
        type: "line",
        yAxisIndex: 1,
        data: months.map((m) => toPercent(m.evaluatedByD3Share)),
        itemStyle: { color: "#f4511e" },
        tooltip: { valueFormatter: (v: number) => (v == null ? "-" : `${v}%`) },
      },
    ],
  };

  return (
    <EChartBase
      option={option}
      style={{ height: "340px" }}
      loading={loading}
      settings={{}}
      theme=""
      onClick={() => {}}
    />
  );
}
