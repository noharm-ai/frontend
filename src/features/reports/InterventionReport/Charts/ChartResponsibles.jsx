import React from "react";

import { EChartBase } from "components/EChartBase";

export default function ChartResponsibles({ reportData, isLoading }) {
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
      data: reportData?.responsibleSummary
        ? reportData?.responsibleSummary.map((i) => i.name)
        : [],
    },
    toolbox: {
      feature: {
        saveAsImage: { title: "Salvar como imagem" },
      },
    },
    series: [
      {
        name: "Aceita",
        type: "bar",
        color: "#90BF71",
        stack: "total",
        data: reportData?.responsibleSummary
          ? reportData?.responsibleSummary.map((i) => i.totals["a"])
          : [],
      },
      {
        name: "Não Aceita",
        type: "bar",
        color: "#E6744E",
        stack: "total",
        data: reportData?.responsibleSummary
          ? reportData?.responsibleSummary.map((i) => i.totals["n"])
          : [],
      },
      {
        name: "Justificada",
        type: "bar",
        color: "#69C1CD",
        stack: "total",
        data: reportData?.responsibleSummary
          ? reportData?.responsibleSummary.map((i) => i.totals["j"])
          : [],
      },
      {
        name: "Pendente",
        type: "bar",
        color: "#FACA5A",
        stack: "total",
        data: reportData?.responsibleSummary
          ? reportData?.responsibleSummary.map((i) => i.totals["s"])
          : [],
      },
      {
        name: "Não se aplica",
        type: "bar",
        color: "#ccc",
        stack: "total",
        data: reportData?.responsibleSummary
          ? reportData?.responsibleSummary.map((i) => ({
              value: i.totals["x"],
              total: i.totals["all"],
            }))
          : [],
        label: {
          show: true,
          position: "right",
          valueAnimation: true,
          formatter: (params) => {
            console.log("params", params);
            return params.data.total;
          },
        },
      },
    ],
  };

  return (
    <EChartBase
      option={chartOptions}
      style={{ height: "50vh", minHeight: "700px" }}
      loading={isLoading}
    />
  );
}
