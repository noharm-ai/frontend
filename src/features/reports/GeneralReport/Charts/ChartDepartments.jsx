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
      data: reportData?.departments
        ? reportData?.departments.map((i) => i.name)
        : [],
    },
    toolbox: {
      feature: {
        saveAsImage: { title: "Salvar como imagem" },
      },
    },
    series: [
      {
        name: "Pacientes-Dia Checados por Setor",
        type: "bar",
        color: "#388e3c",
        data: reportData?.departments
          ? reportData?.departments.map((i) => ({
              value: i.total,
            }))
          : [],
        label: {
          show: true,
          position: "right",
          valueAnimation: true,
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
