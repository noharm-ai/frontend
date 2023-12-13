import React from "react";

import { EChartBase } from "components/EChartBase";

export default function ChartDrugs({ reportData, isLoading }) {
  const maxRows = 30;
  const data = reportData?.drugSummary
    ? reportData.drugSummary.slice(maxRows * -1)
    : [];
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
    xAxis: {
      type: "value",
      boundaryGap: [0, 0.01],
    },
    yAxis: {
      type: "category",
      data: data.map((i) => i.name),
    },
    toolbox: {
      feature: {
        saveAsImage: { title: "Salvar como imagem" },
      },
    },
    series: [
      {
        name: "Não se aplica",
        type: "bar",
        color: "#ccc",
        stack: "total",
        data: data.map((i) => ({
          value: i.totals["x"],
          total: i.totals["all"],
        })),
      },
      {
        name: "Pendente",
        type: "bar",
        color: "#FACA5A",
        stack: "total",
        data: data.map((i) => i.totals["s"]),
      },
      {
        name: "Justificada",
        type: "bar",
        color: "#69C1CD",
        stack: "total",
        data: data.map((i) => i.totals["j"]),
      },

      {
        name: "Não Aceita",
        type: "bar",
        color: "#E6744E",
        stack: "total",
        data: data.map((i) => i.totals["n"]),
      },
      {
        name: "Aceita",
        type: "bar",
        color: "#90BF71",
        stack: "total",
        data: data.map((i) => ({
          value: i.totals["a"],
          total: i.totals["all"],
        })),
        label: {
          show: true,
          position: "right",
          valueAnimation: true,
          formatter: (params) => {
            return params.data.total;
          },
        },
      },
    ],
  };

  return (
    <EChartBase
      option={chartOptions}
      style={{ height: "65vh", minHeight: "700px" }}
      loading={isLoading}
    />
  );
}
