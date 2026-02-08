import { ChartConfig } from "./types";

export const getChartOption = (data: any[], config: ChartConfig) => {
  // Check if we're using count aggregation
  const isCountMode = config.yKeys.includes("__count__");

  let xData: string[];
  let processedData: any[];

  if (isCountMode) {
    // Aggregate data by counting occurrences of X-axis combinations
    const countMap = new Map<string, number>();

    data.forEach((item) => {
      const key = config.xKeys.map((k) => item[k]).join(" - ");
      countMap.set(key, (countMap.get(key) || 0) + 1);
    });

    xData = Array.from(countMap.keys());
    processedData = Array.from(countMap.entries()).map(([key, count]) => ({
      key,
      __count__: count,
    }));
  } else {
    // Use original data
    xData = data.map((item) => config.xKeys.map((k) => item[k]).join(" - "));
    processedData = data;
  }

  if (config.type === "pie") {
    const primaryYKey = config.yKeys[0];
    const pieData = isCountMode
      ? processedData.map((item) => ({
          name: item.key,
          value: item.__count__,
        }))
      : data.map((item) => ({
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
          name: isCountMode
            ? "Contagem"
            : `${primaryYKey} por ${config.xKeys.join("-")}`,
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

  const series = config.yKeys.map((yKey) => {
    if (yKey === "__count__") {
      return {
        name: "Contagem",
        data: processedData.map((item) => item.__count__),
        type: config.type,
      };
    }
    return {
      name: yKey,
      data: isCountMode
        ? processedData.map((item) => {
            // Find original data point matching this x-axis key
            const originalItem = data.find(
              (d) => config.xKeys.map((k) => d[k]).join(" - ") === item.key,
            );
            return originalItem ? originalItem[yKey] : 0;
          })
        : data.map((item) => item[yKey]),
      type: config.type,
    };
  });

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
      data: config.yKeys.map((yKey) =>
        yKey === "__count__" ? "Contagem" : yKey,
      ),
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
