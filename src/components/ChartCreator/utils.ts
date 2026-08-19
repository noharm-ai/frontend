import { AggregationType, ChartConfig, ColorScope, DateGrouping } from "./types";
import { compileExpr, evalCompiled, type ExprNode } from "./expression/exprEngine";
import {
  autoColorAt,
  getColorScope,
  getCustomColors,
  getPaletteColors,
} from "./palettes";

const AGGREGATION_LABEL: Record<AggregationType, string> = {
  none: "",
  count: "Contagem",
  count_pct: "Porcentagem",
  sum: "Soma",
  avg: "Média",
  min: "Mínimo",
  max: "Máximo",
};

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

// --- Grouping ---

/** Groups rows by the composite X key, preserving each group's raw items. */
function groupItems(
  data: any[],
  xKeys: string[],
  dateGrouping: DateGrouping,
): { key: string; items: any[] }[] {
  const groups = new Map<string, { key: string; items: any[] }>();
  data.forEach((item) => {
    const key = buildXKey(item, xKeys, dateGrouping);
    if (!groups.has(key)) groups.set(key, { key, items: [] });
    groups.get(key)!.items.push(item);
  });
  return Array.from(groups.values());
}

// --- Aggregation (legacy path) ---

function groupAndAggregate(
  data: any[],
  xKeys: string[],
  yKeys: string[],
  aggregation: AggregationType,
  dateGrouping: DateGrouping,
) {
  return groupItems(data, xKeys, dateGrouping).map(({ key, items }) => {
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

// --- Scalar helpers (gauge) ---

function aggregateVals(agg: AggregationType, vals: number[]): number {
  if (!vals.length) return 0;
  switch (agg) {
    case "sum":
      return vals.reduce((a, b) => a + b, 0);
    case "avg":
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    case "min":
      return Math.min(...vals);
    case "max":
      return Math.max(...vals);
    default:
      return vals.length;
  }
}

/** Rounds up to a "nice" round number for an auto axis/gauge maximum. */
function niceCeil(v: number): number {
  if (!Number.isFinite(v) || v <= 0) return 100;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  return Math.ceil(v / mag) * mag;
}

// --- Value-series abstraction ---

interface ValueSeries {
  key: string; // property on each processed row holding this series' numeric value
  name: string; // display name (legend/series)
}

// --- Gauge (single scalar over the whole filtered dataset) ---

/** The gauge's single value series — also the key manual colors are stored under. */
function gaugeValueSeries(config: ChartConfig): ValueSeries {
  if (config.series && config.series.length > 0) {
    const s = config.series[0];
    return { key: s.id, name: s.label?.trim() || s.expr };
  }
  const agg =
    config.aggregation && config.aggregation !== "none" ? config.aggregation : "count";
  if (agg === "count" || agg === "count_pct") {
    return { key: "__count__", name: AGGREGATION_LABEL.count };
  }
  const yKey = config.yKeys.find((k) => k !== "__count__");
  return {
    key: yKey ?? "__count__",
    name: yKey ? `${AGGREGATION_LABEL[agg]} de ${yKey}` : AGGREGATION_LABEL[agg],
  };
}

function getGaugeOption(data: any[], config: ChartConfig) {
  const useExpression = !!config.series && config.series.length > 0;
  const { key, name } = gaugeValueSeries(config);
  let value = 0;

  if (useExpression) {
    const { ast } = compileExpr(config.series![0].expr);
    if (ast) {
      try {
        value = evalCompiled(ast as ExprNode, data);
      } catch {
        value = 0;
      }
    }
  } else {
    const agg =
      config.aggregation && config.aggregation !== "none" ? config.aggregation : "count";
    if (agg === "count" || agg === "count_pct") {
      value = data.length;
    } else {
      const yKey = config.yKeys.find((k) => k !== "__count__");
      const vals = yKey ? data.map((i) => Number(i[yKey])).filter((v) => !isNaN(v)) : [];
      value = aggregateVals(agg, vals);
    }
  }

  const rounded = Number.isFinite(value) ? Math.round(value * 100) / 100 : 0;
  const max = config.gaugeMax && config.gaugeMax > 0 ? config.gaugeMax : niceCeil(rounded);
  const colors = getPaletteColors(config.colorPalette);
  const accent = getCustomColors(config, "series")?.[key] ?? colors[0];
  const hasTitle = config.showTitle !== false;

  return {
    ...(hasTitle ? { title: { text: config.title, left: "center", top: 10 } } : {}),
    tooltip: { formatter: "{b}: {c}" },
    toolbox: { feature: { saveAsImage: { title: "Salvar como Imagem" } } },
    series: [
      {
        type: "gauge",
        min: 0,
        max,
        progress: {
          show: true,
          width: 18,
          ...(accent ? { itemStyle: { color: accent } } : {}),
        },
        axisLine: { lineStyle: { width: 18 } },
        axisTick: { show: false },
        splitLine: { length: 12 },
        detail: {
          valueAnimation: true,
          formatter: "{value}",
          fontSize: 28,
          offsetCenter: [0, "72%"],
          ...(accent ? { color: accent } : {}),
        },
        data: [{ value: rounded, name }],
        title: { offsetCenter: [0, "98%"], fontSize: 14 },
      },
    ],
  };
}

// --- Data preparation ---

interface PreparedChart {
  processedData: any[];
  valueSeries: ValueSeries[];
  isCountPct: boolean;
}

/**
 * Turns raw rows into the sorted, trimmed rows the chart plots plus the list of
 * value series. Shared by the renderer and by `getColorTargets`, so the color
 * pickers always list exactly the series/categories that end up on screen.
 */
function prepareChart(data: any[], config: ChartConfig): PreparedChart {
  const dateGrouping: DateGrouping = config.dateGrouping ?? "none";
  const useExpression = !!config.series && config.series.length > 0;

  let valueSeries: ValueSeries[];
  let processedData: any[];
  let isCount = false;
  let isCountPct = false;
  let countTotal = 0;

  if (useExpression) {
    // --- Expression path ---
    const compiled = config.series!.map((s) => {
      const { ast } = compileExpr(s.expr);
      return { id: s.id, name: s.label?.trim() || s.expr, ast };
    });

    processedData = groupItems(data, config.xKeys, dateGrouping).map(({ key, items }) => {
      const row: any = { __xKey__: key };
      compiled.forEach(({ id, ast }) => {
        let value = 0;
        if (ast) {
          try {
            value = evalCompiled(ast as ExprNode, items);
          } catch {
            value = 0;
          }
        }
        row[id] = Number.isFinite(value) ? value : 0;
      });
      return row;
    });

    valueSeries = compiled.map(({ id, name }) => ({ key: id, name }));
  } else {
    // --- Legacy path ---
    // Backward compat: treat __count__ sentinel as count aggregation
    const effectiveAggregation: AggregationType =
      config.aggregation && config.aggregation !== "none"
        ? config.aggregation
        : config.yKeys.includes("__count__")
          ? "count"
          : "none";

    const isAggregated = effectiveAggregation !== "none";
    isCountPct = effectiveAggregation === "count_pct";
    isCount = effectiveAggregation === "count" || isCountPct;

    if (isAggregated) {
      processedData = groupAndAggregate(
        data,
        config.xKeys,
        isCount ? [] : config.yKeys,
        effectiveAggregation,
        dateGrouping,
      );
      if (isCountPct) {
        countTotal = processedData.reduce((sum, item) => sum + (item.__count__ ?? 0), 0);
      }
    } else {
      processedData = data.map((item) => ({
        ...item,
        __xKey__: buildXKey(item, config.xKeys, dateGrouping),
      }));
    }

    const seriesLabel = isCountPct
      ? AGGREGATION_LABEL.count_pct
      : isCount
        ? AGGREGATION_LABEL.count
        : effectiveAggregation !== "none"
          ? AGGREGATION_LABEL[effectiveAggregation]
          : undefined;

    valueSeries = isCount
      ? [{ key: "__count__", name: AGGREGATION_LABEL.count }]
      : config.yKeys
          .filter((k) => k !== "__count__")
          .map((yKey) => ({
            key: yKey,
            name: seriesLabel ? `${seriesLabel} de ${yKey}` : yKey,
          }));
  }

  const primaryKey = valueSeries[0]?.key;

  // Sort by value
  const sortOrder = config.sortOrder ?? "none";
  if (sortOrder !== "none") {
    const isStacked = !!config.stacked && (config.type === "bar" || config.type === "hbar");
    const getSortValue = (row: any): number => {
      if (isStacked && valueSeries.length > 1) {
        return valueSeries.reduce((sum, vs) => sum + (Number(row[vs.key]) || 0), 0);
      }
      return Number(row[primaryKey]) || 0;
    };
    processedData = [...processedData].sort((a, b) => {
      const av = getSortValue(a);
      const bv = getSortValue(b);
      return sortOrder === "asc" ? av - bv : bv - av;
    });
  }

  // Top N
  const topN = config.topN ?? 0;
  if (topN > 0) {
    processedData = processedData.slice(0, topN);
  }

  // Sort by X axis
  const xSortOrder = config.xSortOrder ?? "none";
  if (xSortOrder !== "none") {
    processedData = [...processedData].sort((a, b) => {
      const cmp = String(a.__xKey__).localeCompare(String(b.__xKey__));
      return xSortOrder === "asc" ? cmp : -cmp;
    });
  }

  // Normalize counts to percentages (after sort/topN, using pre-filter total)
  if (isCountPct && countTotal > 0) {
    processedData = processedData.map((item) => ({
      ...item,
      __raw_count__: item.__count__,
      __count__: parseFloat(((item.__count__ / countTotal) * 100).toFixed(1)),
    }));
  }

  return { processedData, valueSeries, isCountPct };
}

// --- Manual colors ---

export interface ColorTarget {
  /** Key the manual color is stored under (series key or category label). */
  key: string;
  label: string;
  /** Color the chart uses for this target when no manual color is set. */
  autoColor: string;
}

/**
 * The series or categories of `config` that can be individually colored, in the
 * order they are drawn. `autoColor` is what the chart shows today, so a picker
 * seeded with it produces no visual change until the user edits it.
 */
export function getColorTargets(
  data: any[],
  config: ChartConfig,
): { scope: ColorScope; targets: ColorTarget[] } {
  if (config.type === "gauge") {
    const { key, name } = gaugeValueSeries(config);
    return {
      scope: "series",
      targets: [{ key, label: name || "Valor", autoColor: autoColorAt(config.colorPalette, 0) }],
    };
  }

  const { processedData, valueSeries } = prepareChart(data, config);
  const scope = getColorScope(config, valueSeries.length);

  if (scope === "series") {
    return {
      scope,
      targets: valueSeries.map((vs, i) => ({
        key: vs.key,
        label: vs.name,
        autoColor: autoColorAt(config.colorPalette, i),
      })),
    };
  }

  // Pie and funnel give each slice its own automatic color; a single-series bar
  // chart draws every bar in the series color, so they all start out equal.
  const perCategoryAuto = config.type === "pie" || config.type === "funnel";
  const seen = new Set<string>();
  const targets: ColorTarget[] = [];
  processedData.forEach((item) => {
    const label = String(item.__xKey__ ?? "");
    if (seen.has(label)) return;
    seen.add(label);
    targets.push({
      key: label,
      label,
      autoColor: autoColorAt(config.colorPalette, perCategoryAuto ? targets.length : 0),
    });
  });

  return { scope, targets };
}

/** Wraps a raw data point so a manual color can be attached to it. */
function withItemColor(point: any, color: string | undefined) {
  if (!color) return point;
  const base =
    point !== null && typeof point === "object" ? point : { value: point };
  return { ...base, itemStyle: { ...(base.itemStyle ?? {}), color } };
}

// --- Main ---

export const getChartOption = (data: any[], config: ChartConfig) => {
  if (config.type === "gauge") return getGaugeOption(data, config);

  const { processedData, isCountPct, valueSeries } = prepareChart(data, config);
  const primaryKey = valueSeries[0]?.key;
  const primaryName = valueSeries[0]?.name ?? "";

  const colorScope = getColorScope(config, valueSeries.length);
  const customColors = getCustomColors(config, colorScope);
  const categoryColor = (label: any): string | undefined =>
    colorScope === "category" ? customColors?.[String(label ?? "")] : undefined;

  const xData = processedData.map((item) => item.__xKey__);
  const showLabels = config.showLabels ?? false;
  const colors = getPaletteColors(config.colorPalette);
  // When colors are assigned per series, resolve each series' color (custom or
  // automatic) and drive the chart-level `color` from it, so the LEGEND matches
  // the chosen colors — ECharts colors legend items from this array by index.
  // Category scope keeps the raw palette (its per-item overrides also color the
  // pie/funnel legend entries).
  const legendColorList =
    colorScope === "series"
      ? valueSeries.map(
          (vs, i) => customColors?.[vs.key] ?? autoColorAt(config.colorPalette, i),
        )
      : colors;
  const hasTitle = config.showTitle !== false;
  const titleOption = hasTitle
    ? { title: { text: config.title, left: "center", top: 10 } }
    : {};
  const legendTop = hasTitle ? 50 : 20;

  if (config.type === "pie") {
    const pieData = (isCountPct
      ? processedData.map((item) => ({
          name: item.__xKey__,
          value: item.__count__,
          rawCount: item.__raw_count__,
        }))
      : processedData.map((item) => ({
          name: item.__xKey__,
          value: item[primaryKey],
        }))
    ).map((point) => withItemColor(point, categoryColor(point.name)));

    const seriesName = primaryName || "Valor";

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
      legend: { orient: "vertical", left: "left", top: legendTop },
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

  if (config.type === "funnel") {
    const funnelData = (isCountPct
      ? processedData.map((item) => ({
          name: item.__xKey__,
          value: item.__count__,
          rawCount: item.__raw_count__,
        }))
      : processedData.map((item) => ({ name: item.__xKey__, value: item[primaryKey] }))
    ).map((point) => withItemColor(point, categoryColor(point.name)));

    return {
      ...titleOption,
      ...(colors.length ? { color: colors } : {}),
      tooltip: isCountPct
        ? {
            trigger: "item",
            formatter: (params: any) =>
              `${params.marker}${params.name}<br/>${params.data?.rawCount} (${params.value}%)`,
          }
        : { trigger: "item", formatter: "{b}: {c}" },
      toolbox: { feature: { saveAsImage: { title: "Salvar como Imagem" } } },
      legend: { top: legendTop },
      series: [
        {
          name: primaryName || "Valor",
          type: "funnel",
          left: "10%",
          right: "10%",
          top: legendTop + 10,
          bottom: 10,
          minSize: "0%",
          maxSize: "100%",
          // Order is already handled by the sort/xSort controls above.
          sort: "none",
          gap: 2,
          label: {
            show: true,
            position: "inside",
            formatter: isCountPct
              ? (params: any) => `${params.name}: ${params.data.rawCount} (${params.value}%)`
              : "{b}: {c}",
          },
          emphasis: { label: { fontSize: 16 } },
          data: funnelData,
        },
      ],
    };
  }

  if (config.type === "radar") {
    const indicator = xData.map((axisName, i) => {
      const perAxisMax = Math.max(
        1,
        ...valueSeries.map((vs) => Number(processedData[i]?.[vs.key]) || 0),
      );
      return { name: String(axisName), max: niceCeil(perAxisMax) };
    });

    // A radar chart is a single series whose data entries are the metrics, so
    // manual colors go on each entry (line included) rather than on the series.
    const radarData = valueSeries.map((vs) => {
      const color = customColors?.[vs.key];
      return {
        name: vs.name,
        value: processedData.map((item) => Number(item[vs.key]) || 0),
        ...(color ? { itemStyle: { color }, lineStyle: { color } } : {}),
      };
    });

    return {
      ...titleOption,
      ...(legendColorList.length ? { color: legendColorList } : {}),
      tooltip: { trigger: "item" },
      toolbox: { feature: { saveAsImage: { title: "Salvar como Imagem" } } },
      legend: { data: valueSeries.map((vs) => vs.name), top: legendTop },
      radar: { indicator, center: ["50%", "58%"], radius: "65%" },
      series: [
        {
          type: "radar",
          data: radarData,
          areaStyle: { opacity: 0.1 },
          label: { show: showLabels },
        },
      ],
    };
  }

  const isHBar = config.type === "hbar";
  const isStacked = !!config.stacked && (config.type === "bar" || config.type === "hbar");
  const stackTotals = isStacked && valueSeries.length > 1
    ? processedData.map((item) => valueSeries.reduce((sum, vs) => sum + (Number(item[vs.key]) || 0), 0))
    : null;

  const isHBarNonStacked = isHBar && !isStacked;
  const HBAR_LABEL_MIN_RATIO = 0.15;

  // Max raw count across all items — used to threshold isCountPct hbar labels
  const hbarCountMax = isHBar && isCountPct
    ? Math.max(1, ...processedData.map((item) => Number(item.__raw_count__) || 0))
    : 0;

  // Max value across all items — used to threshold non-count non-stacked hbar labels
  const hbarDataMax = isHBarNonStacked && !isCountPct
    ? Math.max(
        1,
        ...processedData.map((item) =>
          Math.max(...valueSeries.map((vs) => Number(item[vs.key]) || 0)),
        ),
      )
    : 0;

  // Max stack total — used to threshold stacked hbar labels by physical bar width
  const maxStackTotal = stackTotals ? Math.max(1, ...stackTotals) : 0;

  const baseFormatter = isCountPct
    ? (params: any) => {
        if (isHBar && (params.data?.rawCount ?? 0) / hbarCountMax < HBAR_LABEL_MIN_RATIO) return "";
        return `${params.data.rawCount} (${params.value}%)`;
      }
    : stackTotals
      ? (params: any) => {
          const total = params.data?.total;
          if (!total || !params.value) return "";
          if (isHBar && params.value / total < HBAR_LABEL_MIN_RATIO) return "";
          if (isHBar && total / maxStackTotal < HBAR_LABEL_MIN_RATIO) return "";
          return `${params.value} (${((params.value / total) * 100).toFixed(1)}%)`;
        }
      : (params: any) => String(params.value ?? "");

  const label = {
    show: showLabels,
    position: isStacked ? "inside" as const : (isHBar ? "inside" as const : "top" as const),
    formatter: isHBarNonStacked && !isCountPct
      ? (params: any) => {
          if ((params.value ?? 0) / hbarDataMax < HBAR_LABEL_MIN_RATIO) return "";
          return baseFormatter(params);
        }
      : baseFormatter,
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

  const series = valueSeries.map((vs, idx) => {
    const seriesCustomColor = colorScope === "series" ? customColors?.[vs.key] : undefined;
    return {
      name: vs.name,
      data: processedData.map((item, i) => {
        const point = isCountPct
          ? { value: item[vs.key], rawCount: item.__raw_count__ }
          : stackTotals
            ? { value: Number(item[vs.key]) || 0, total: stackTotals[i] }
            : item[vs.key];
        return withItemColor(point, categoryColor(item.__xKey__));
      }),
      type: echartsType,
      label,
      ...(seriesCustomColor ? { itemStyle: { color: seriesCustomColor } } : {}),
      // Only attach markLine to the first series to avoid duplication
      ...(idx === 0 && markLine ? { markLine } : {}),
      ...(isStacked ? { stack: "total" } : {}),
    };
  });

  const legendData = valueSeries.map((vs) => vs.name);

  return {
    ...titleOption,
    ...(legendColorList.length ? { color: legendColorList } : {}),
    grid: {
      left: "3%",
      right: "10%",
      bottom: "3%",
      top: hasTitle ? 90 : 60,
      containLabel: true,
    },
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
      } : stackTotals ? {
        formatter: (params: any) => {
          const list = Array.isArray(params) ? params : [params];
          const total = list.reduce((sum, p) => sum + (Number(p.value) || 0), 0);
          const name = list[0]?.name ?? "";
          const rows = list
            .map((p: any) => {
              const pct = total > 0 ? ` (${((Number(p.value) / total) * 100).toFixed(1)}%)` : "";
              return `${p.marker}${p.seriesName}: ${p.value}${pct}`;
            })
            .join("<br/>");
          return `${name}<br/>Total: ${total}<br/>${rows}`;
        },
      } : {}),
    },
    toolbox: { feature: { saveAsImage: { title: "Salvar como Imagem" } } },
    legend: { data: legendData, top: legendTop },
    xAxis: isHBar
      ? { type: "value", ...(isCountPct ? { axisLabel: { formatter: "{value}%" } } : {}) }
      : {
          type: "category",
          data: xData,
          ...(config.xLabelRotate
            ? { axisLabel: { rotate: config.xLabelRotate, interval: 0 } }
            : {}),
        },
    yAxis: isHBar ? { type: "category", data: xData, inverse: true } : { type: "value", ...(isCountPct ? { axisLabel: { formatter: "{value}%" } } : {}) },
    series,
  };
};
