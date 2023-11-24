import React from "react";

import { EChartBase } from "components/EChartBase";

export default function ChartResponsibles({ reportData, isLoading }) {
  const chartOptions = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params) {
        const sData = params[0];
        return `${sData.seriesName}<br />
                <strong>${sData.name}:</strong> ${sData.data.value} (${sData.data.percentage}%)`;
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
      data: reportData?.responsibles
        ? reportData?.responsibles.map((i) => i.name)
        : [],
    },
    series: [
      {
        name: "Prescrições Checadas",
        type: "bar",
        color: "#388e3c",
        data: reportData?.responsibles
          ? reportData?.responsibles.map((i) => ({
              value: i.total,
              percentage: i.percentage,
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
