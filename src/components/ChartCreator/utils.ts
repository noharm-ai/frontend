import { ChartConfig } from "./types";

export const getChartOption = (data: any[], config: ChartConfig) => {
  const xData = data.map((item) =>
    config.xKeys.map((k) => item[k]).join(" - "),
  );

  if (config.type === "pie") {
    const primaryYKey = config.yKeys[0];
    const pieData = data.map((item) => ({
      name: config.xKeys.map((k) => item[k]).join(" - "),
      value: item[primaryYKey],
    }));

    return {
      title: {
        text: config.title,
        left: "center",
      },
      tooltip: {
        trigger: "item",
      },
      toolbox: {
        feature: {
          saveAsImage: { title: "Salvar como Imagem" },
        },
      },
      legend: {
        orient: "vertical",
        left: "left",
      },
      series: [
        {
          name: `${primaryYKey} por ${config.xKeys.join("-")}`,
          type: "pie",
          radius: "50%",
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };
  }

  const series = config.yKeys.map((yKey) => ({
    name: yKey,
    data: data.map((item) => item[yKey]),
    type: config.type,
  }));

  return {
    title: {
      text: config.title,
      left: "center",
    },
    tooltip: {
      trigger: "axis",
    },
    toolbox: {
      feature: {
        saveAsImage: { title: "Salvar como Imagem" },
      },
    },
    legend: {
      data: config.yKeys,
      top: 30, // Adjust legend position to avoid overlap with title
    },
    xAxis: {
      type: "category",
      data: xData,
    },
    yAxis: {
      type: "value",
    },
    series: series,
  };
};
