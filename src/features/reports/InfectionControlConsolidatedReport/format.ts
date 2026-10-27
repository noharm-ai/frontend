import { IQuantiles } from "./infectionControlReportTypes";

/**
 * Formatting of the report numbers: the service answers shares as 0-1 and
 * quantiles as { median, p90, count }; a missing number shows as "-".
 */

export const EMPTY = "-";

export const formatInteger = (value?: number | null) =>
  value == null ? EMPTY : value.toLocaleString();

export const formatDecimal = (value?: number | null, digits = 1) =>
  value == null
    ? EMPTY
    : value.toLocaleString(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });

export const formatShare = (value?: number | null) =>
  value == null ? EMPTY : `${formatDecimal(value * 100)}%`;

// the median of a quantiles block, with its unit
export const formatMedian = (
  quantiles: IQuantiles | null | undefined,
  unit: string,
) =>
  quantiles?.median == null
    ? EMPTY
    : `${formatDecimal(quantiles.median)} ${unit}`;

// a share as a 0-100 number for the charts
export const toPercent = (value?: number | null) =>
  value == null ? null : Math.round(value * 1000) / 10;
