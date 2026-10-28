import { useTranslation } from "react-i18next";

import { EChartBase } from "components/EChartBase";
import Empty from "components/Empty";

import { formatPeriod, formatShare } from "../format";
import { REGISTRY_COLORS, REGISTRY_STATUSES } from "../options";
import { ITrendPoint, TrendScale } from "../infectionControlReportTypes";

interface RegistryChartProps {
  points: ITrendPoint[];
  scale: TrendScale;
  loading?: boolean;
}

interface TooltipItem {
  dataIndex: number;
  marker: string;
  seriesName: string;
  value: number;
}

/**
 * The antimicrobial days of each month or day by the record in force on them
 * (conforming, non-conforming, never evaluated, expired), stacked: each bar is
 * the period's DOT.
 */
export function RegistryChart({
  points,
  scale,
  loading = false,
}: RegistryChartProps) {
  const { t } = useTranslation();

  if (!loading && points.length === 0) {
    return <Empty description={t("infectionControlConsolidated.noData")} />;
  }

  const labels = points.map((p) => formatPeriod(p.period, scale));

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      // the days of each record and their share of the period's DOT
      formatter: (items: TooltipItem[]) => {
        if (!items.length) return "";
        const point = points[items[0].dataIndex];
        const lines = items.map(
          (item) =>
            `${item.marker} ${item.seriesName}: ${item.value.toLocaleString()} (${formatShare(
              point.dot ? item.value / point.dot : null,
            )})`,
        );

        return [
          `<strong>${labels[items[0].dataIndex]}</strong> · ${t(
            "infectionControlConsolidated.monthly.dot",
          )}: ${point.dot.toLocaleString()}`,
          ...lines,
        ].join("<br/>");
      },
    },
    legend: {},
    grid: { left: 50, right: 30, top: 40, bottom: scale === "day" ? 70 : 30 },
    toolbox: {
      feature: {
        saveAsImage: { title: t("infectionControlConsolidated.saveAsImage") },
      },
    },
    // a year of days needs zooming
    dataZoom: scale === "day" ? [{ type: "inside" }, { type: "slider" }] : [],
    xAxis: { type: "category", data: labels },
    yAxis: { type: "value" },
    series: REGISTRY_STATUSES.map((status) => ({
      name: t(`infectionControlConsolidated.status.${status}`),
      type: "bar",
      stack: "registry",
      data: points.map((p) => p.verdictDays?.[status] || 0),
      itemStyle: { color: REGISTRY_COLORS[status] },
    })),
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
