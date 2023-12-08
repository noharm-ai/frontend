import React from "react";

import { EChartBase } from "components/EChartBase";

export default function ChartPrescriptionDay({ reportData, isLoading }) {
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
      data: ["Pacientes-Dia", "Pacientes-Dia Checados"],
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
        name: "Pacientes-Dia",
        type: "line",
        areaStyle: {
          color: "#1e88e5",
          opacity: 0.2,
        },
        color: "#1565c0",
        emphasis: {
          focus: "series",
        },
        data: reportData?.prescriptionPlotSeries
          ? reportData.prescriptionPlotSeries.map(({ total }) => total)
          : [],
      },
      {
        name: "Pacientes-Dia Checados",
        type: "line",
        areaStyle: {
          color: "#74b077",
          opacity: 0.5,
        },
        color: "#388e3c",
        emphasis: {
          focus: "series",
        },
        data: reportData?.prescriptionPlotSeries
          ? reportData.prescriptionPlotSeries.map(({ checked }) => checked)
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
