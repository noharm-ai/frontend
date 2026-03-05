import { AggregationType, ChartConfig, DateGrouping, DerivedColumn, DerivedColumnOperand } from "./types";

const AGGREGATION_LABEL: Record<AggregationType, string> = {
  none: "",
  count: "Contagem",
  sum: "Soma",
  avg: "Média",
  min: "Mínimo",
  max: "Máximo",
};

// --- Derived columns ---

function evalOperand(op: DerivedColumnOperand, row: any): number {
  return op.type === "column" ? Number(row[op.columnKey!]) || 0 : op.number ?? 0;
}

function applyDerivedColumns(data: any[], cols: DerivedColumn[]): any[] {
  if (!cols || cols.length === 0) return data;
  return data.map((row) => {
    const enriched = { ...row };
    for (const dc of cols) {
      if (!dc.name) continue;
      const l = evalOperand(dc.left, row);
      const r = evalOperand(dc.right, row);
      enriched[dc.name] =
        dc.operator === "+" ? l + r :
        dc.operator === "-" ? l - r :
        dc.operator === "*" ? l * r :
        r !== 0 ? l / r : 0;
    }
    return enriched;
  });
}

// --- Date grouping ---

function formatDateKey(value: any, grouping: DateGrouping): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value ?? "");
  if (grouping === "year") return `${d.getFullYear()}`;
  if (grouping === "quarter") return `${d.getFullYear()}-T${Math.floor(d.getMonth() / 3) + 1}`;
  if (grouping === "month") {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  if (grouping === "week") {
    const start = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil((((d.getTime() - start.getTime()) / 86400000) + start.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
  }
  // day
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildXKey(item: any, xKeys: string[], dateGrouping: DateGrouping): string {
  return xKeys.map((k) =>
    dateGrouping !== "none" ? formatDateKey(item[k], dateGrouping) : String(item[k] ?? ""),
  ).join(" - ");
}

// --- Aggregation ---

function groupAndAggregate(
  data: any[],
  xKeys: string[],
  yKeys: string[],
  aggregation: AggregationType,
  dateGrouping: DateGrouping,
) {
  const groups = new Map<string, { key: string; items: any[] }>();

  data.forEach((item) => {
    const key = buildXKey(item, xKeys, dateGrouping);
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
        row[yKey] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      } else if (aggregation === "min") {
        row[yKey] = vals.length ? Math.min(...vals) : 0;
      } else if (aggregation === "max") {
        row[yKey] = vals.length ? Math.max(...vals) : 0;
      }
    });

    return row;
  });
}

function getPrimaryValue(row: any, isCount: boolean, primaryYKey: string): number {
  if (isCount) return row.__count__ ?? 0;
  return Number(row[primaryYKey]) || 0;
}

// --- Main ---

export const getChartOption = (data: any[], config: ChartConfig) => {
  // Apply derived columns first so they're available everywhere
  const enrichedData = applyDerivedColumns(data, config.derivedColumns ?? []);

  const dateGrouping: DateGrouping = config.dateGrouping ?? "none";

  // Backward compat: treat __count__ sentinel as count aggregation
  const effectiveAggregation: AggregationType =
    config.aggregation && config.aggregation !== "none"
      ? config.aggregation
      : config.yKeys.includes("__count__")
        ? "count"
        : "none";

  const isAggregated = effectiveAggregation !== "none";
  const isCount = effectiveAggregation === "count";
  const primaryYKey = config.yKeys.filter((k) => k !== "__count__")[0];

  let processedData: any[];

  if (isAggregated) {
    processedData = groupAndAggregate(
      enrichedData,
      config.xKeys,
      isCount ? [] : config.yKeys,
      effectiveAggregation,
      dateGrouping,
    );
  } else {
    processedData = enrichedData.map((item) => ({
      ...item,
      __xKey__: buildXKey(item, config.xKeys, dateGrouping),
    }));
  }

  // Sort
  const sortOrder = config.sortOrder ?? "none";
  if (sortOrder !== "none") {
    processedData = [...processedData].sort((a, b) => {
      const av = getPrimaryValue(a, isCount, primaryYKey);
      const bv = getPrimaryValue(b, isCount, primaryYKey);
      return sortOrder === "asc" ? av - bv : bv - av;
    });
  }

  // Top N
  const topN = config.topN ?? 0;
  if (topN > 0) {
    processedData = processedData.slice(0, topN);
  }

  const xData = processedData.map((item) => item.__xKey__);
  const showLabels = config.showLabels ?? false;

  const seriesLabel = isCount
    ? AGGREGATION_LABEL.count
    : effectiveAggregation !== "none"
      ? `${AGGREGATION_LABEL[effectiveAggregation]}`
      : undefined;

  if (config.type === "pie") {
    const pieData = isAggregated
      ? processedData.map((item) => ({
          name: item.__xKey__,
          value: isCount ? item.__count__ : item[primaryYKey],
        }))
      : processedData.map((item) => ({
          name: item.__xKey__,
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
          label: { show: showLabels, position: "outside" },
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

  const label = { show: showLabels, position: "top" as const, formatter: "{c}" };

  const series = isCount
    ? [
        {
          name: "Contagem",
          data: processedData.map((item) => item.__count__),
          type: config.type,
          label,
        },
      ]
    : config.yKeys
        .filter((yKey) => yKey !== "__count__")
        .map((yKey) => ({
          name: seriesLabel ? `${seriesLabel} de ${yKey}` : yKey,
          data: processedData.map((item) => item[yKey]),
          type: config.type,
          label,
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
