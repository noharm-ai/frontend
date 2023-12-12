import React from "react";
import { useTranslation } from "react-i18next";

import { EChartBase } from "components/EChartBase";

export default function ChartStatus({ reportData, isLoading }) {
  const { t } = useTranslation();
  const chartOptions = {
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        return `<strong>${params.data.name}:</strong> ${params.data.value}% (${params.data.total})`;
      },
    },
    legend: {
      top: "0",
      left: "center",
    },
    toolbox: {
      feature: {
        saveAsImage: { title: "Salvar como imagem" },
      },
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
        data: reportData?.statusSummary
          ? reportData.statusSummary.map((i) => ({
              ...i,
              name: t(`interventionStatus.${i.name}`),
            }))
          : [],
        color: ["#90BF71", "#69C1CD", "#E6744E", "#FACA5A", "#ccc"],
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
