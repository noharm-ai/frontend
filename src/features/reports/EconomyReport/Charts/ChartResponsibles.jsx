import React from "react";

import { EChartBase } from "components/EChartBase";
import { formatCurrency } from "utils/number";

export default function ChartResponsibles({ reportData, isLoading }) {
  const chartOptions = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params) {
        const labels = params.map((p) => {
          return `<strong>${p.seriesName}:</strong> R$ ${formatCurrency(
            p.value
          )}`;
        });

        return `${params[0].axisValue}<br/> ${labels.join("<br/>")}`;
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
        name: "Suspensão",
        type: "bar",
        color: "#9789D9",
        stack: "total",
        data: reportData?.responsibleSummary
          ? reportData?.responsibleSummary.map((i) => ({
              value: i.totals["suspension"].toFixed(2),
              total: i.totals["all"].toFixed(2),
            }))
          : [],
      },
      {
        name: "Substituição",
        type: "bar",
        color: "#F78B52",
        stack: "total",
        data: reportData?.responsibleSummary
          ? reportData?.responsibleSummary.map((i) => ({
              value: i.totals["substitution"].toFixed(2),
              total: i.totals["all"].toFixed(2),
            }))
          : [],
        label: {
          show: true,
          position: "right",
          valueAnimation: true,
          formatter: (params) => {
            return `R$ ${formatCurrency(params.data.total)}`;
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
