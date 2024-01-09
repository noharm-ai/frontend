import React from "react";

import { EChartBase } from "components/EChartBase";

export default function ChartDepartments({ reportData, isLoading }) {
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
      data: reportData?.departmentSummary
        ? reportData?.departmentSummary.map((i) => i.name)
        : [],
    },
    toolbox: {
      feature: {
        saveAsImage: { title: "Salvar como imagem" },
      },
    },
    series: [
      {
        name: "Deschecagem",
        type: "bar",
        color: "#E6744E",
        stack: "total",
        data: reportData?.departmentSummary
          ? reportData?.departmentSummary.map((i) => i.totals["uncheck"])
          : [],
      },
      {
        name: "Checagem",
        type: "bar",
        color: "#90BF71",
        stack: "total",
        data: reportData?.departmentSummary
          ? reportData?.departmentSummary.map((i) => ({
              value: i.totals["check"],
              total: i.totals["all"],
            }))
          : [],
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
      style={{ height: "60vh", minHeight: "700px" }}
      loading={isLoading}
    />
  );
}
