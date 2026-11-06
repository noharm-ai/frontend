import { useTranslation } from "react-i18next";

import { EChartBase } from "components/EChartBase";
import Empty from "components/Empty";

import { formatPeriod, formatShare } from "../format";
import { treatmentTypeName } from "../indication";
import { TREATMENT_TYPE_GROUPS } from "../options";
import { IUsePoint } from "../infectionControlReportTypes";

interface IndicationTrendChartProps {
  points: IUsePoint[];
  loading?: boolean;
}

interface TooltipItem {
  dataIndex: number;
  marker: string;
  seriesName: string;
  seriesId: string;
}

/**
 * The share of each month's DOT by the treatment type in force on the days
 * (empirical, culture guided, prophylaxis, not informed), stacked to 100%.
 */
export function IndicationTrendChart({
  points,
  loading = false,
}: IndicationTrendChartProps) {
  const { t } = useTranslation();

  if (!loading && points.length === 0) {
    return <Empty description={t("infectionControlConsolidated.noData")} />;
  }

  const labels = points.map((p) => formatPeriod(p.period, "month"));
  // the types with days in the period, in their order
  const groups = TREATMENT_TYPE_GROUPS.filter((g) =>
    points.some((p) => p.treatmentTypeDays?.[g.key]),
  );
  const share = (point: IUsePoint, key: string) =>
    point.dot ? (point.treatmentTypeDays?.[key] || 0) / point.dot : null;

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      // each type's share of the month and its days
      formatter: (items: TooltipItem[]) => {
        if (!items.length) return "";
        const point = points[items[0].dataIndex];
        const lines = items.map(
          (item) =>
            `${item.marker} ${item.seriesName}: ${formatShare(
              share(point, item.seriesId),
            )} (${(point.treatmentTypeDays?.[item.seriesId] || 0).toLocaleString()})`,
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
    series: groups.map((g) => ({
      id: g.key,
      name: treatmentTypeName(g.key, t),
      type: "bar",
      stack: "indication",
      data: points.map((p) => {
        const value = share(p, g.key);
        return value == null ? null : Math.round(value * 1000) / 10;
      }),
      itemStyle: { color: g.color },
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
