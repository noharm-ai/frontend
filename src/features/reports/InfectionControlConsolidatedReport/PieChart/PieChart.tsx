import { useTranslation } from "react-i18next";

import { EChartBase } from "components/EChartBase";
import Empty from "components/Empty";

export interface IPieSlice {
  name: string;
  value: number;
  color?: string;
}

// what ECharts hands the formatters of a slice
interface ISliceParams {
  name: string;
  value: number;
  percent: number;
}

interface PieChartProps {
  slices: IPieSlice[];
  loading?: boolean;
}

/** The parts of a whole (slices with no value are left out). */
export function PieChart({ slices, loading = false }: PieChartProps) {
  const { t } = useTranslation();
  const shown = slices.filter((s) => s.value);

  if (!loading && shown.length === 0) {
    return <Empty description={t("infectionControlConsolidated.noData")} />;
  }

  const option = {
    tooltip: {
      trigger: "item",
      formatter: (params: ISliceParams) =>
        `<strong>${params.name}:</strong> ${params.value.toLocaleString()} (${params.percent}%)`,
    },
    legend: { bottom: 0, left: "center" },
    toolbox: {
      feature: {
        saveAsImage: { title: t("infectionControlConsolidated.saveAsImage") },
      },
    },
    series: [
      {
        type: "pie",
        radius: ["35%", "65%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 2 },
        label: {
          show: true,
          formatter: (params: ISliceParams) =>
            `${params.name}\n${params.percent}%`,
        },
        data: shown.map((s) => ({
          name: s.name,
          value: s.value,
          ...(s.color ? { itemStyle: { color: s.color } } : {}),
        })),
      },
    ],
  };

  return (
    <EChartBase
      option={option}
      style={{ height: "320px" }}
      loading={loading}
      settings={{}}
      theme=""
      onClick={() => {}}
    />
  );
}
