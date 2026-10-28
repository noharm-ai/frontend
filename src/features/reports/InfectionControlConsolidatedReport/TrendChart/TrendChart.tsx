import { useTranslation } from "react-i18next";

import { EChartBase } from "components/EChartBase";
import Empty from "components/Empty";

import { formatPeriod, toPercent } from "../format";
import { ITrendPoint, TrendScale } from "../infectionControlReportTypes";

interface TrendChartProps {
  points: ITrendPoint[];
  scale: TrendScale;
  loading?: boolean;
}

/** DOT by month or day (bars) with the share of conforming evaluations (line). */
export function TrendChart({
  points,
  scale,
  loading = false,
}: TrendChartProps) {
  const { t } = useTranslation();
  const tk = (key: string) => t(`infectionControlConsolidated.monthly.${key}`);

  if (!loading && points.length === 0) {
    return <Empty description={t("infectionControlConsolidated.noData")} />;
  }

  const option = {
    tooltip: { trigger: "axis" },
    legend: {},
    grid: { left: 50, right: 50, top: 40, bottom: scale === "day" ? 70 : 30 },
    toolbox: {
      feature: {
        saveAsImage: { title: t("infectionControlConsolidated.saveAsImage") },
      },
    },
    // a year of days needs zooming
    dataZoom: scale === "day" ? [{ type: "inside" }, { type: "slider" }] : [],
    xAxis: {
      type: "category",
      data: points.map((p) => formatPeriod(p.period, scale)),
    },
    yAxis: [
      { type: "value", name: tk("dot") },
      {
        type: "value",
        min: 0,
        max: 100,
        axisLabel: { formatter: "{value}%" },
      },
    ],
    series: [
      {
        name: tk("dot"),
        type: "bar",
        data: points.map((p) => p.dot),
        itemStyle: { color: "#90caf9", borderRadius: [4, 4, 0, 0] },
      },
      {
        name: tk("conforming"),
        type: "line",
        yAxisIndex: 1,
        connectNulls: true,
        data: points.map((p) => toPercent(p.conformingShare)),
        itemStyle: { color: "#388e3c" },
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
