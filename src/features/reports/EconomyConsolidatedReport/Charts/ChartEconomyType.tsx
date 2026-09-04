import { EChartBase } from "components/EChartBase";
import { formatCurrency } from "utils/number";

import { ECONOMY_TYPE_COLORS } from "../options";

interface ChartEconomyTypeProps {
  reportData: any;
  isLoading: boolean;
}

export default function ChartEconomyType({
  reportData,
  isLoading,
}: ChartEconomyTypeProps) {
  const totals = reportData?.totals || {};

  const slices = [
    {
      name: "Suspensão",
      value: totals.total_economy_suspension || 0,
      color: ECONOMY_TYPE_COLORS.suspension,
    },
    {
      name: "Substituição",
      value: totals.total_economy_substitution || 0,
      color: ECONOMY_TYPE_COLORS.substitution,
    },
    {
      name: "Customizada",
      value: totals.total_economy_custom || 0,
      color: ECONOMY_TYPE_COLORS.custom,
    },
  ].filter((s) => s.value !== 0);

  const chartOptions = {
    tooltip: {
      trigger: "item",
      formatter: (params: any) =>
        `<strong>${params.name}:</strong> R$ ${formatCurrency(
          params.value,
        )} (${params.percent}%)`,
    },
    legend: {
      bottom: 0,
      left: "center",
    },
    toolbox: {
      feature: {
        saveAsImage: { title: "Salvar como imagem" },
      },
    },
    series: [
      {
        type: "pie",
        radius: ["35%", "70%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: (params: any) => `${params.name}\n${params.percent}%`,
        },
        labelLine: {
          show: true,
        },
        data: slices.map((s) => ({ name: s.name, value: s.value })),
        color: slices.map((s) => s.color),
      },
    ],
  };

  return (
    <EChartBase
      option={chartOptions}
      style={{ height: "100%", minHeight: "320px" }}
      loading={isLoading}
      settings={{}}
      theme=""
      onClick={() => {}}
    />
  );
}
