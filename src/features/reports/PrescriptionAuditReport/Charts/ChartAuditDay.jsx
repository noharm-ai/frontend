import React from "react";

import { EChartBase } from "components/EChartBase";

export default function ChartAuditDay({ reportData, isLoading }) {
  const chartOptions = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#6a7985",
        },
      },
    },
    legend: {
      data: ["Checagem", "Deschecagem"],
    },
    toolbox: {
      feature: {
        saveAsImage: { title: "Salvar como imagem" },
      },
    },
    grid: {
      left: "2%",
      right: "3%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        data: reportData?.days || [],
      },
    ],
    yAxis: [
      {
        type: "value",
      },
    ],
    series: [
      {
        name: "Checagem",
        type: "line",
        color: "#90BF71",
        emphasis: {
          focus: "series",
        },
        data: reportData?.auditPlotSeries
          ? reportData.auditPlotSeries.map(({ check }) => check)
          : [],
      },
      {
        name: "Deschecagem",
        type: "line",
        color: "#E6744E",
        emphasis: {
          focus: "series",
        },
        data: reportData?.auditPlotSeries
          ? reportData.auditPlotSeries.map(({ uncheck }) => uncheck)
          : [],
      },
    ],
  };

  return (
    <EChartBase
      option={chartOptions}
      style={{ height: "40vh", minHeight: "500px" }}
      loading={isLoading}
    />
  );
}
