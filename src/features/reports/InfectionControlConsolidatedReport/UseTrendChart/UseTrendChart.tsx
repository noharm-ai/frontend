import { useTranslation } from "react-i18next";

import { EChartBase } from "components/EChartBase";
import Empty from "components/Empty";

import { formatDecimal, formatPeriod } from "../format";
import { IUsePoint } from "../infectionControlReportTypes";

interface UseTrendChartProps {
  points: IUsePoint[];
  loading?: boolean;
}

/**
 * DOT and LOT per 1,000 patient-days of each month, with DOT/LOT on its own
 * axis: a month without patient-days leaves a gap in the rates.
 */
export function UseTrendChart({ points, loading = false }: UseTrendChartProps) {
  const { t } = useTranslation();
  const tk = (key: string) => t(`infectionControlConsolidated.dotLot.${key}`);

  if (!loading && points.length === 0) {
    return <Empty description={t("infectionControlConsolidated.noData")} />;
  }

  const line = (
    name: string,
    data: (number | null)[],
    color: string,
    yAxisIndex = 0,
  ) => ({
    name,
    type: "line",
    data,
    yAxisIndex,
    connectNulls: false,
    symbolSize: 6,
    itemStyle: { color },
    lineStyle: { color, type: yAxisIndex ? "dashed" : "solid" },
  });

  const option = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: number | null) => formatDecimal(value, 2),
    },
    legend: {},
    // room for the axis names under the legend and the save icon
    grid: { left: 50, right: 50, top: 70, bottom: 30 },
    toolbox: {
      top: 0,
      right: 10,
      feature: {
        saveAsImage: { title: t("infectionControlConsolidated.saveAsImage") },
      },
    },
    xAxis: {
      type: "category",
      data: points.map((p) => formatPeriod(p.period, "month")),
    },
    yAxis: [
      { type: "value", name: tk("per1000Axis") },
      { type: "value", name: tk("dotLot"), splitLine: { show: false } },
    ],
    series: [
      line(
        tk("dotPer1000Line"),
        points.map((p) => p.dotPer1000PatientDays),
        "#1e88e5",
      ),
      line(
        tk("lotPer1000Line"),
        points.map((p) => p.lotPer1000PatientDays),
        "#74b077",
      ),
      line(
        tk("dotLot"),
        points.map((p) => p.dotLot),
        "#f2b530",
        1,
      ),
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
