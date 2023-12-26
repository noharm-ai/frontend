import React from "react";

import { EChartBase } from "components/EChartBase";

export default function ChartScores({ reportData, isLoading }) {
  const data = reportData?.scoreSummary ? reportData?.scoreSummary : [];
  const chartOptions = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {},
    grid: {
      left: "3%",
      right: "3%",
      bottom: "2%",
      containLabel: true,
    },
    yAxis: {
      type: "value",
      boundaryGap: [0, 0.01],
    },
    xAxis: {
      type: "category",
      data: ["Verde", "Amarelo", "Laranja", "Vermelho"],
    },
    toolbox: {
      feature: {
        saveAsImage: { title: "Salvar como imagem" },
      },
    },
    series: [
      {
        name: "Pacientes-Dia Pendentes",
        type: "bar",
        color: "#ccc",
        stack: "total",
        data: data.map((i) => ({
          value: i.pending,
        })),
      },
      {
        name: "Pacientes-Dia Checados",
        type: "bar",
        color: "#90BF71",
        stack: "total",
        data: data.map((i) => ({
          value: i.checked,
          total: i.total,
          percentage: i.percentage,
        })),
        label: {
          show: true,
          position: "top",
          valueAnimation: true,
          formatter: (params) => {
            return `Total: ${params.data.total}\nChecados: ${params.data.percentage}%`;
          },
        },
      },
    ],
  };

  return (
    <EChartBase
      option={chartOptions}
      style={{ height: "40vh", minHeight: "600px" }}
      loading={isLoading}
    />
  );
}
