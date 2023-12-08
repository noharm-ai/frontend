import React from "react";

import { EChartBase } from "components/EChartBase";

export default function ChartSegments({ reportData, isLoading }) {
  const chartOptions = {
    tooltip: {
      trigger: "item",
    },
    legend: {
      top: "0",
      left: "center",
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
        },
        labelLine: {
          show: true,
        },
        data: reportData?.segments ? reportData.segments : [],
        color: ["#9789D9", "#F78B52", "#67DBDD", "#B8B4E8", "#EAD76F"],
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
