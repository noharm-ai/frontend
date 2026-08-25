/**
 * Reconciliation of charts copied from another report.
 *
 * A chart references its report's columns by name, so charts copied from a
 * different report (possibly from another schema) only render if every
 * referenced column also exists in the destination dataset. These helpers find
 * the referenced columns, report which ones are missing, and rewrite a chart
 * onto the destination columns once the user has mapped them.
 */

import type { ColumnSchema, Filter } from "src/utils/dataFilters";
import { exprToTokens, tokensToExpr, validateExpr } from "./expression/exprEngine";
import type { ChartConfig } from "./types";

/** yKeys sentinel meaning "row count"; it is not a column and is never mapped. */
export const COUNT_KEY = "__count__";

/** Destination column chosen for a missing source column; null means "skip". */
export type ColumnMapping = Record<string, string | null>;

export interface ChartCopyAnalysis {
  chart: ChartConfig;
  /** Every destination column the chart needs, deduplicated. */
  referenced: string[];
  /** The referenced columns absent from the destination dataset. */
  missing: string[];
  /**
   * An expression series that no longer parses. Such a chart cannot be rewritten
   * onto other columns, so it can only be left out of the copy.
   */
  exprParseError: boolean;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

/** Columns referenced by a chart, plus whether one of its expressions is broken. */
export function collectReferencedColumns(chart: ChartConfig): {
  columns: string[];
  exprParseError: boolean;
} {
  const columns = new Set<string>();
  let exprParseError = false;

  (chart.xKeys ?? []).forEach((key) => {
    if (key) columns.add(key);
  });

  (chart.yKeys ?? []).forEach((key) => {
    if (key && key !== COUNT_KEY) columns.add(key);
  });

  (chart.filters ?? []).forEach((filter) => {
    if (filter.field) columns.add(filter.field);
  });

  (chart.series ?? []).forEach((serie) => {
    const tokens = exprToTokens(serie.expr);

    if (!tokens) {
      exprParseError = true;
      return;
    }

    tokens.forEach((token) => {
      if (token.kind === "agg" && token.column) columns.add(token.column);
    });
  });

  return { columns: Array.from(columns), exprParseError };
}

/** Classifies each chart against the destination columns. */
export function classifyCharts(
  charts: ChartConfig[],
  targetKeys: string[],
): ChartCopyAnalysis[] {
  const available = new Set(targetKeys);

  return charts.map((chart) => {
    const { columns, exprParseError } = collectReferencedColumns(chart);

    return {
      chart,
      referenced: columns,
      missing: columns.filter((column) => !available.has(column)),
      exprParseError,
    };
  });
}

/** Applies the mapping to a column: unmapped columns are kept as they are. */
const mapColumn = (
  column: string,
  mapping: ColumnMapping,
): string | null => {
  if (!(column in mapping)) return column;
  return mapping[column];
};

const mapKeys = (keys: string[], mapping: ColumnMapping): string[] => {
  const mapped = keys
    .map((key) => (key === COUNT_KEY ? key : mapColumn(key, mapping)))
    .filter((key): key is string => !!key);

  return Array.from(new Set(mapped));
};

const mapFilters = (
  filters: Filter[],
  mapping: ColumnMapping,
  targetSchema: ColumnSchema[],
): Filter[] => {
  const byKey = new Map(targetSchema.map((column) => [column.key, column]));

  return filters.reduce<Filter[]>((kept, filter) => {
    const field = mapColumn(filter.field, mapping);
    if (!field) return kept;

    const column = byKey.get(field);
    if (!column) return kept;

    // A filter carried over to a different column keeps only the values that
    // column actually has; a filter left with no values would hide every row.
    if (field !== filter.field && Array.isArray(filter.value)) {
      const options = new Set(column.options ?? []);
      const value = filter.value.filter((item: any) => options.has(String(item)));

      if (value.length === 0) return kept;

      return [...kept, { ...filter, id: generateId(), field, value }];
    }

    return [...kept, { ...filter, id: generateId(), field }];
  }, []);
};

/**
 * Rewrites the columns of an expression through the mapping. Serialization
 * re-quotes column names, so names containing spaces survive the round trip.
 * Returns null when the expression cannot be parsed or a column was skipped.
 */
const mapExpr = (expr: string, mapping: ColumnMapping): string | null => {
  const tokens = exprToTokens(expr);
  if (!tokens) return null;

  const mapped = [];

  for (const token of tokens) {
    if (token.kind !== "agg" || !token.column) {
      mapped.push(token);
      continue;
    }

    const column = mapColumn(token.column, mapping);
    if (!column) return null;

    mapped.push({ ...token, column });
  }

  return tokensToExpr(mapped);
};

const mapColorKeys = (
  colors: Record<string, string>,
  mapping: ColumnMapping,
  seriesIds: Record<string, string>,
): Record<string, string> =>
  Object.entries(colors).reduce<Record<string, string>>(
    (kept, [key, color]) => {
      if (key === COUNT_KEY) return { ...kept, [key]: color };

      // A series key is either a series id or a column name.
      const mapped = seriesIds[key] ?? mapColumn(key, mapping);
      if (!mapped) return kept;

      return { ...kept, [mapped]: color };
    },
    {},
  );

/** Appends "(cópia)" until the title no longer collides with an existing one. */
const uniqueTitle = (title: string, taken: string[]): string => {
  if (!taken.includes(title)) return title;

  const candidate = `${title} (cópia)`;
  if (!taken.includes(candidate)) return candidate;

  let counter = 2;
  while (taken.includes(`${title} (cópia ${counter})`)) counter += 1;

  return `${title} (cópia ${counter})`;
};

/** Defaults of a chart config, shared by imported and agent-generated charts. */
export function withChartDefaults(chart: ChartConfig): ChartConfig {
  return {
    aggregation: "none",
    sortOrder: "none",
    xSortOrder: "none",
    xLabelRotate: 0,
    topN: 0,
    showLabels: false,
    height: 400,
    dateGrouping: "none",
    showTitle: true,
    colorPalette: "default",
    colorMode: "palette",
    stacked: false,
    filters: [],
    ...chart,
    id: generateId(),
    // Series may arrive without ids; the builder and the renderer key each
    // series by id, so ensure every one has a stable id of its own.
    ...(chart.series
      ? {
          series: chart.series.map((serie) => ({
            ...serie,
            id: serie.id || generateId(),
          })),
        }
      : {}),
  };
}

/**
 * Rewrites a copied chart onto the destination report.
 *
 * Returns null when the chart cannot be represented there: an expression that
 * does not parse, or one whose column the user chose to skip.
 */
export function remapChart(
  chart: ChartConfig,
  mapping: ColumnMapping,
  targetSchema: ColumnSchema[],
  existingTitles: string[],
): ChartConfig | null {
  const remapped = withChartDefaults(chart);

  // A copy keeps nothing from the source report's identity space, so series get
  // fresh ids and the color keys pointing at them follow.
  const seriesIds: Record<string, string> = {};

  if (remapped.series) {
    const series = [];

    for (const serie of remapped.series) {
      const expr = mapExpr(serie.expr, mapping);
      if (expr === null) return null;

      const validation = validateExpr(expr, targetSchema);
      if (!validation.ok) return null;

      const id = generateId();
      seriesIds[serie.id] = id;

      series.push({ ...serie, id, expr });
    }

    remapped.series = series;
  }

  remapped.xKeys = mapKeys(chart.xKeys ?? [], mapping);
  remapped.yKeys = mapKeys(chart.yKeys ?? [], mapping);

  // The gauge is a single scalar and has no X axis; for every other type an
  // empty one leaves nothing to plot. A chart with no value series falls back
  // to counting rows, which stays valid.
  if (remapped.type !== "gauge" && remapped.xKeys.length === 0) return null;

  remapped.filters = mapFilters(chart.filters ?? [], mapping, targetSchema);

  if (remapped.seriesColors) {
    remapped.seriesColors = mapColorKeys(
      remapped.seriesColors,
      mapping,
      seriesIds,
    );
  }

  // Category colors are keyed by data values of the source dataset, which say
  // nothing about the destination one.
  delete remapped.categoryColors;

  remapped.title = uniqueTitle(chart.title ?? "", existingTitles);

  return remapped;
}
