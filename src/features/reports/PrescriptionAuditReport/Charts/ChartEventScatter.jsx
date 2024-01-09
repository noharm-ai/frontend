import React from "react";
import { convertRange } from "utils/report";

import { EChartBase } from "components/EChartBase";

export default function ChartEventScatter({ reportData, isLoading }) {
  const days = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];
  const hours = [];
  for (let h = 0; h < 24; h++) {
    hours.push(
      h.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })
    );
  }

  let maxValue = 0;
  const title = [];
  const singleAxis = [];
  const series = [];

  if (reportData.eventScatter) {
    reportData.eventScatter.forEach(function (i) {
      if (i[2] > maxValue) {
        maxValue = i[2];
      }
    });
  }

  days.forEach(function (day, idx) {
    title.push({
      textBaseline: "middle",
      top: ((idx + 0.5) * 100) / 7 + "%",
      text: day,
    });
    singleAxis.push({
      left: 150,
      type: "category",
      boundaryGap: false,
      data: hours,
      top: (idx * 100) / 7 + 5 + "%",
      height: 100 / 7 - 10 + "%",
      axisLabel: {
        interval: 2,
      },
    });
    series.push({
      singleAxisIndex: idx,
      coordinateSystem: "singleAxis",
      type: "scatter",
      data: [],
      symbolSize: function (dataItem) {
        return dataItem[1] === 0
          ? 0
          : convertRange(dataItem[1], [0, maxValue], [10, 100]);
      },
    });
  });
  if (reportData.eventScatter) {
    reportData.eventScatter.forEach(function (dataItem) {
      series[dataItem[0]].data.push([dataItem[1], dataItem[2]]);
    });
  }

  const chartOptions = {
    tooltip: {
      position: "top",
    },
    title: title,
    singleAxis: singleAxis,
    series: series,
  };

  return (
    <EChartBase
      option={chartOptions}
      style={{ height: "50vh", minHeight: "700px" }}
      loading={isLoading}
    />
  );
}
