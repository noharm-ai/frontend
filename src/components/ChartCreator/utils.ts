import { AggregationType, ChartConfig } from "./types";

const AGGREGATION_LABEL: Record<AggregationType, string> = {
  none: "",
  count: "Contagem",
  sum: "Soma",
  avg: "Média",
  min: "Mínimo",
  max: "Máximo",
};

function groupAndAggregate(
  data: any[],
  xKeys: string[],
  yKeys: string[],
  aggregation: AggregationType,
) {
  const groups = new Map<string, { key: string; items: any[] }>();

  data.forEach((item) => {
    const key = xKeys.map((k) => item[k]).join(" - ");
    if (!groups.has(key)) groups.set(key, { key, items: [] });
    groups.get(key)!.items.push(item);
  });

  return Array.from(groups.values()).map(({ key, items }) => {
    const row: any = { __xKey__: key, __count__: items.length };

    yKeys.forEach((yKey) => {
      const vals = items
        .map((i) => Number(i[yKey]))
        .filter((v) => !isNaN(v));

      if (aggregation === "sum") {
        row[yKey] = vals.reduce((a, b) => a + b, 0);
      } else if (aggregation === "avg") {
        row[yKey] = vals.length
          ? vals.reduce((a, b) => a + b, 0) / vals.length
          : 0;
      } else if (aggregation === "min") {
        row[yKey] = vals.length ? Math.min(...vals) : 0;
      } else if (aggregation === "max") {
        row[yKey] = vals.length ? Math.max(...vals) : 0;
      }
    });

    return row;
  });
}

export const getChartOption = (data: any[], config: ChartConfig) => {
  // Backward compat: treat __count__ sentinel as count aggregation
  const effectiveAggregation: AggregationType =
    config.aggregation && config.aggregation !== "none"
      ? config.aggregation
      : config.yKeys.includes("__count__")
        ? "count"
        : "none";

  const isAggregated = effectiveAggregation !== "none";
  const isCount = effectiveAggregation === "count";

  let xData: string[];
  let processedData: any[];

  if (isAggregated) {
    processedData = groupAndAggregate(
      data,
      config.xKeys,
      isCount ? [] : config.yKeys,
      effectiveAggregation,
    );
    xData = processedData.map((item) => item.__xKey__);
  } else {
    processedData = data;
    xData = data.map((item) => config.xKeys.map((k) => item[k]).join(" - "));
  }

  const seriesLabel = isCount
    ? AGGREGATION_LABEL.count
    : effectiveAggregation !== "none"
      ? `${AGGREGATION_LABEL[effectiveAggregation]}`
      : undefined;

  if (config.type === "pie") {
    const primaryYKey = config.yKeys[0];
    const pieData = isAggregated
      ? processedData.map((item) => ({
          name: item.__xKey__,
          value: isCount ? item.__count__ : item[primaryYKey],
        }))
      : data.map((item) => ({
          name: config.xKeys.map((k) => item[k]).join(" - "),
          value: item[primaryYKey],
        }));

    const seriesName = isCount
      ? "Contagem"
      : seriesLabel
        ? `${seriesLabel} de ${primaryYKey}`
        : `${primaryYKey} por ${config.xKeys.join("-")}`;

    return {
      title: { text: config.title, left: "center" },
      tooltip: { trigger: "item" },
      toolbox: { feature: { saveAsImage: { title: "Salvar como Imagem" } } },
      legend: { orient: "vertical", left: "left" },
      series: [
        {
          name: seriesName,
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

  const series = isCount
    ? [
        {
          name: "Contagem",
          data: processedData.map((item) => item.__count__),
          type: config.type,
        },
      ]
    : config.yKeys
        .filter((yKey) => yKey !== "__count__")
        .map((yKey) => ({
          name: seriesLabel ? `${seriesLabel} de ${yKey}` : yKey,
          data: isAggregated
            ? processedData.map((item) => item[yKey])
            : data.map((item) => item[yKey]),
          type: config.type,
        }));

  const legendData = isCount
    ? ["Contagem"]
    : config.yKeys
        .filter((yKey) => yKey !== "__count__")
        .map((yKey) => (seriesLabel ? `${seriesLabel} de ${yKey}` : yKey));

  return {
    title: { text: config.title, left: "center" },
    tooltip: { trigger: "axis" },
    toolbox: { feature: { saveAsImage: { title: "Salvar como Imagem" } } },
    legend: { data: legendData, top: 30 },
    xAxis: { type: "category", data: xData },
    yAxis: { type: "value" },
    series,
  };
};
