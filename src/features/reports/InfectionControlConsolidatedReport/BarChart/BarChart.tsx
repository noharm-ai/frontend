import { useTranslation } from "react-i18next";

import { EChartBase } from "components/EChartBase";
import Empty from "components/Empty";

export interface IBarItem {
  name: string;
  value: number | null;
}

interface BarChartProps {
  items: IBarItem[];
  // horizontal bars, for long names (reasons, substances)
  horizontal?: boolean;
  suffix?: string;
  color?: string;
  loading?: boolean;
}

/** Bars of one series, largest first as the service sends them. */
export function BarChart({
  items,
  horizontal = false,
  suffix = "",
  color = "#1e88e5",
  loading = false,
}: BarChartProps) {
  const { t } = useTranslation();

  if (!loading && items.length === 0) {
    return <Empty description={t("infectionControlConsolidated.noData")} />;
  }

  const names = items.map((i) => i.name);
  const values = items.map((i) => i.value);
  // horizontal bars read top-down, so the first item goes on top
  const categoryAxis = {
    type: "category",
    data: horizontal ? [...names].reverse() : names,
    axisLabel: horizontal
      ? { width: 220, overflow: "truncate" }
      : { interval: 0 },
  };
  const valueAxis = {
    type: "value",
    axisLabel: { formatter: `{value}${suffix}` },
  };

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (value: number) =>
        value == null ? "-" : `${value.toLocaleString()}${suffix}`,
    },
    grid: {
      left: horizontal ? 230 : 40,
      right: 30,
      top: 10,
      bottom: 30,
    },
    toolbox: {
      feature: {
        saveAsImage: { title: t("infectionControlConsolidated.saveAsImage") },
      },
    },
    xAxis: horizontal ? valueAxis : categoryAxis,
    yAxis: horizontal ? categoryAxis : valueAxis,
    series: [
      {
        type: "bar",
        data: horizontal ? [...values].reverse() : values,
        itemStyle: {
          color,
          borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
        },
        label: {
          show: true,
          position: horizontal ? "right" : "top",
          formatter: ({ value }: { value: number | null }) =>
            value == null ? "" : `${value.toLocaleString()}${suffix}`,
        },
      },
    ],
  };

  const height = horizontal ? Math.max(240, items.length * 28 + 60) : 300;

  return (
    <EChartBase
      option={option}
      style={{ height: `${height}px` }}
      loading={loading}
      settings={{}}
      theme=""
      onClick={() => {}}
    />
  );
}
