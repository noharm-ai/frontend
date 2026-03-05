import { AggregationType, ChartConfig, DateGrouping, DerivedColumn, DerivedColumnOperand } from "./types";

const AGGREGATION_LABEL: Record<AggregationType, string> = {
  none: "",
  count: "Contagem",
  count_pct: "Porcentagem",
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

// --- Color palettes ---

const COLOR_PALETTES: Record<string, string[]> = {
  default:  [],
  noharm:   ["#2e3c5a", "#7ebe9a", "#70bdc3", "#e46666", "#f2b530", "#696766"],
  blues:    ["#1a237e", "#1565c0", "#1976d2", "#42a5f5", "#90caf9", "#bbdefb"],
  greens:   ["#1b5e20", "#388e3c", "#66bb6a", "#a5d6a7", "#c8e6c9", "#43a047"],
  warm:     ["#bf360c", "#e64a19", "#ff7043", "#ffa726", "#ffca28", "#ffee58"],
  pastel:   ["#b39ddb", "#90caf9", "#80cbc4", "#a5d6a7", "#ffcc80", "#f48fb1"],
  contrast: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"],
};

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
  const isCountPct = effectiveAggregation === "count_pct";
  const isCount = effectiveAggregation === "count" || isCountPct;
  const primaryYKey = config.yKeys.filter((k) => k !== "__count__")[0];

  let processedData: any[];
  let countTotal = 0;

  if (isAggregated) {
    processedData = groupAndAggregate(
      enrichedData,
      config.xKeys,
      isCount ? [] : config.yKeys,
      effectiveAggregation,
      dateGrouping,
    );
    if (isCountPct) {
      countTotal = processedData.reduce((sum, item) => sum + (item.__count__ ?? 0), 0);
    }
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

  // Normalize counts to percentages (after sort/topN, using pre-filter total)
  if (isCountPct && countTotal > 0) {
    processedData = processedData.map((item) => ({
      ...item,
      __raw_count__: item.__count__,
      __count__: parseFloat(((item.__count__ / countTotal) * 100).toFixed(1)),
    }));
  }

  const xData = processedData.map((item) => item.__xKey__);
  const showLabels = config.showLabels ?? false;
  const colors = COLOR_PALETTES[config.colorPalette ?? "default"] ?? [];
  const titleOption = config.showTitle !== false
    ? { title: { text: config.title, left: "center" } }
    : {};

  const seriesLabel = isCountPct
    ? AGGREGATION_LABEL.count_pct
    : isCount
      ? AGGREGATION_LABEL.count
      : effectiveAggregation !== "none"
        ? `${AGGREGATION_LABEL[effectiveAggregation]}`
        : undefined;

  if (config.type === "pie") {
    const pieData = isAggregated
      ? processedData.map((item) => ({
          name: item.__xKey__,
          value: isCount ? item.__count__ : item[primaryYKey],
          ...(isCountPct ? { rawCount: item.__raw_count__ } : {}),
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
      ...titleOption,
      ...(colors.length ? { color: colors } : {}),
      tooltip: isCountPct
        ? {
            trigger: "item",
            formatter: (params: any) =>
              `${params.marker}${params.name}<br/>${params.seriesName}: ${params.data?.rawCount} (${params.value}%)`,
          }
        : { trigger: "item" },
      toolbox: { feature: { saveAsImage: { title: "Salvar como Imagem" } } },
      legend: { orient: "vertical", left: "left" },
      series: [
        {
          name: seriesName,
          type: "pie",
          radius: "50%",
          data: pieData,
          label: {
            show: showLabels,
            position: "outside",
            formatter: isCountPct
              ? (params: any) => `${params.data.rawCount} (${params.value}%)`
              : undefined,
          },
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

  const isHBar = config.type === "hbar";
  const label = {
    show: showLabels,
    position: isHBar ? "right" as const : "top" as const,
    formatter: isCountPct
      ? (params: any) => `${params.data.rawCount} (${params.value}%)`
      : "{c}",
  };

  const markLine = config.referenceLine
    ? {
        silent: true,
        data: [
          {
            [isHBar ? "xAxis" : "yAxis"]: config.referenceLine.value,
            name: config.referenceLine.label ?? "",
          },
        ],
        label: {
          formatter: config.referenceLine.label
            ? `${config.referenceLine.label}: {c}`
            : "{c}",
        },
        lineStyle: { color: "#ff4d4f", type: "dashed" as const },
      }
    : undefined;

  const echartsType = isHBar ? "bar" : config.type;

  const series = isCount
    ? [
        {
          name: "Contagem",
          data: processedData.map((item) =>
            isCountPct
              ? { value: item.__count__, rawCount: item.__raw_count__ }
              : item.__count__
          ),
          type: echartsType,
          label,
          markLine,
        },
      ]
    : config.yKeys
        .filter((yKey) => yKey !== "__count__")
        .map((yKey, idx) => ({
          name: seriesLabel ? `${seriesLabel} de ${yKey}` : yKey,
          data: processedData.map((item) => item[yKey]),
          type: echartsType,
          label,
          // Only attach markLine to the first series to avoid duplication
          ...(idx === 0 && markLine ? { markLine } : {}),
        }));

  const legendData = isCount
    ? ["Contagem"]
    : config.yKeys
        .filter((yKey) => yKey !== "__count__")
        .map((yKey) => (seriesLabel ? `${seriesLabel} de ${yKey}` : yKey));

  return {
    ...titleOption,
    ...(colors.length ? { color: colors } : {}),
    tooltip: {
      trigger: "axis",
      ...(isCountPct ? {
        formatter: (params: any) => {
          const list = Array.isArray(params) ? params : [params];
          const name = list[0]?.name ?? "";
          const rows = list
            .map((p: any) => `${p.marker}${p.seriesName}: ${p.data?.rawCount} (${p.value}%)`)
            .join("<br/>");
          return `${name}<br/>${rows}`;
        },
      } : {}),
    },
    toolbox: { feature: { saveAsImage: { title: "Salvar como Imagem" } } },
    legend: { data: legendData, top: 30 },
    xAxis: isHBar ? { type: "value", ...(isCountPct ? { axisLabel: { formatter: "{value}%" } } : {}) } : { type: "category", data: xData },
    yAxis: isHBar ? { type: "category", data: xData } : { type: "value", ...(isCountPct ? { axisLabel: { formatter: "{value}%" } } : {}) },
    series,
  };
};
