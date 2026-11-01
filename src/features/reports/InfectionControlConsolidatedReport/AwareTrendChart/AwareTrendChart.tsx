import { useTranslation } from "react-i18next";

import { EChartBase } from "components/EChartBase";
import Empty from "components/Empty";

import { formatPeriod, formatShare } from "../format";
import { AWARE_GROUPS } from "../options";
import { IUsePoint } from "../infectionControlReportTypes";

interface AwareTrendChartProps {
  points: IUsePoint[];
  loading?: boolean;
}

interface TooltipItem {
  dataIndex: number;
  marker: string;
  seriesName: string;
  seriesId: string;
}

// the WHO target for the Access group, as a share of the DOT
const ACCESS_TARGET = 60;

/**
 * The share of each month's DOT in each AWaRe group, stacked to 100%, Access
 * at the bottom so the WHO target line reads against it.
 */
export function AwareTrendChart({
  points,
  loading = false,
}: AwareTrendChartProps) {
  const { t } = useTranslation();

  if (!loading && points.length === 0) {
    return <Empty description={t("infectionControlConsolidated.noData")} />;
  }

  const labels = points.map((p) => formatPeriod(p.period, "month"));
  // the groups with days in the period, in the AWaRe order
  const groups = AWARE_GROUPS.filter((g) =>
    points.some((p) => p.awareDays?.[g.key]),
  );
  const share = (point: IUsePoint, key: string) =>
    point.dot ? (point.awareDays?.[key] || 0) / point.dot : null;

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      // each group's share of the month and its days
      formatter: (items: TooltipItem[]) => {
        if (!items.length) return "";
        const point = points[items[0].dataIndex];
        const lines = items.map(
          (item) =>
            `${item.marker} ${item.seriesName}: ${formatShare(
              share(point, item.seriesId),
            )} (${(point.awareDays?.[item.seriesId] || 0).toLocaleString()})`,
        );

        return [
          `<strong>${labels[items[0].dataIndex]}</strong>`,
          ...lines,
        ].join("<br/>");
      },
    },
    legend: {},
    grid: { left: 50, right: 30, top: 40, bottom: 30 },
    toolbox: {
      feature: {
        saveAsImage: { title: t("infectionControlConsolidated.saveAsImage") },
      },
    },
    xAxis: { type: "category", data: labels },
    yAxis: { type: "value", max: 100, axisLabel: { formatter: "{value}%" } },
    series: groups.map((g, index) => ({
      id: g.key,
      name: t(`infectionControlConsolidated.aware.${g.key}`),
      type: "bar",
      stack: "aware",
      data: points.map((p) => {
        const value = share(p, g.key);
        return value == null ? null : Math.round(value * 1000) / 10;
      }),
      itemStyle: { color: g.color },
      // the target line rides on the first (Access) series
      ...(index === 0 && g.key === "access"
        ? {
            markLine: {
              symbol: "none",
              silent: true,
              lineStyle: { color: "#424242", type: "dashed" },
              label: {
                formatter: t("infectionControlConsolidated.dotLot.awareTarget"),
                position: "insideEndTop",
                // readable over the bars
                backgroundColor: "#fff",
                padding: [2, 4],
              },
              data: [{ yAxis: ACCESS_TARGET }],
            },
          }
        : {}),
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
