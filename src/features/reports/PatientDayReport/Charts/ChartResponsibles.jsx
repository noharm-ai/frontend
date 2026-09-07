import React from "react";

import { EChartBase } from "components/EChartBase";
import { HIDDEN_NAME } from "utils/report";
import { FeatureService } from "services/FeatureService";
import Feature from "models/Feature";

export default function ChartResponsibles({ reportData, isLoading }) {
  const hideNames = FeatureService.has(Feature.HIDE_NAMES);
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
      right: "10%",
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
        ? reportData?.responsibles.map((i) =>
            hideNames ? HIDDEN_NAME : i.name,
          )
        : [],
    },
    toolbox: {
      feature: {
        saveAsImage: { title: "Salvar como imagem" },
      },
    },
    series: [
      {
        name: "Pacientes-Dia Checados por Responsável",
        type: "bar",
        color: "#90BF71",
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
