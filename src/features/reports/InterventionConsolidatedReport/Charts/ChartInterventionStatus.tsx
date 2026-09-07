import { EChartBase } from "components/EChartBase";
import { STATUS_OPTIONS } from "../options";

interface ChartInterventionStatusProps {
  reportData: any;
  isLoading: boolean;
}

export function ChartInterventionStatus({
  reportData,
  isLoading,
}: ChartInterventionStatusProps) {
  const totals = reportData?.totals || {};
  const total = totals.total_interventions || 0;

  const data = STATUS_OPTIONS.map((s) => ({
    name: s.label,
    total: totals[s.field] || 0,
    value: total
      ? Number((((totals[s.field] || 0) * 100) / total).toFixed(1))
      : 0,
  })).filter((i) => i.total > 0);

  const chartOptions = {
    tooltip: {
      trigger: "item",
      formatter: (params: any) =>
        `<strong>${params.data.name}:</strong> ${params.data.value}% (${params.data.total.toLocaleString()})`,
    },
    legend: {
      top: "0",
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
        radius: ["20%", "70%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: "{b}: {c}%",
        },
        labelLine: {
          show: true,
        },
        data,
        color: STATUS_OPTIONS.filter((s) => (totals[s.field] || 0) > 0).map(
          (s) => s.color,
        ),
      },
    ],
  };

  return (
    <EChartBase
      option={chartOptions}
      style={{ height: "40vh", minHeight: "500px" }}
      loading={isLoading}
      settings={{}}
      theme=""
      onClick={() => {}}
    />
  );
}
