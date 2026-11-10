import type { TFunction } from "i18next";

import { formatDate } from "utils/date";

import {
  IExamTriggerCondition,
  IExamTriggerResult,
} from "./InfectionControlSlice";

// an exam value as the exam rows show it, with the decimals of pt-BR
export const formatExamValue = (value: number | null | undefined) =>
  value == null
    ? "-"
    : value.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

// a signed percent: "+30%", "-25%"
export const formatVariation = (value: number) =>
  `${value > 0 ? "+" : ""}${formatExamValue(value)}%`;

// whether a rule compares the result with the one at review time: without
// that one (no baseline) these conditions never fire
export const hasVariation = (rule: IExamTriggerCondition) =>
  [
    rule.variationAbove,
    rule.variationAtLeast,
    rule.variationBelow,
    rule.variationAtMost,
  ].some((value) => value != null);

// a variation condition, by its comparison: "variação ≥ +20%"
const variation = (
  key:
    | "variationAbove"
    | "variationAtLeast"
    | "variationBelow"
    | "variationAtMost",
  value: number | null | undefined,
  t: TFunction,
) =>
  value != null &&
  t(`infectionControl.examTriggers.${key}`, { value: formatVariation(value) });

/**
 * The conditions of a rule, in a few words: "> 1,5 e variação > +30%",
 * "< 60 e variação < -25%", "> 38 a partir do D4", "> 50 e variação ≥ +20%"
 */
export const describeExamTriggerRule = (
  rule: IExamTriggerCondition,
  t: TFunction,
) => {
  const conditions = [
    rule.valueAbove != null && `> ${formatExamValue(rule.valueAbove)}`,
    rule.valueAtLeast != null && `≥ ${formatExamValue(rule.valueAtLeast)}`,
    rule.valueBelow != null && `< ${formatExamValue(rule.valueBelow)}`,
    rule.valueAtMost != null && `≤ ${formatExamValue(rule.valueAtMost)}`,
    variation("variationAbove", rule.variationAbove, t),
    variation("variationAtLeast", rule.variationAtLeast, t),
    variation("variationBelow", rule.variationBelow, t),
    variation("variationAtMost", rule.variationAtMost, t),
  ].filter(Boolean);

  return [
    conditions.join(t("infectionControl.examTriggers.and")),
    rule.fromCourseDay != null &&
      t("infectionControl.examTriggers.fromCourseDay", {
        day: rule.fromCourseDay,
      }),
  ]
    .filter(Boolean)
    .join(" ");
};

// a rule the schema can fire: one without the flag (the rules an evaluation
// recorded) is taken as available
export const isExamTriggerAvailable = (
  rule: IExamTriggerCondition & { available?: boolean },
) => rule.available !== false;

// a result with its unit: "1,8 mg/dL"
export const formatExamResult = (result: IExamTriggerResult) =>
  [formatExamValue(result.value), result.unit].filter(Boolean).join(" ");

/**
 * A result with its unit and date, and the creatinine an eGFR was calculated
 * from: "52 ml/min/1.73 em 05/11/2026 14:00 (creatinina 1,9 mg/dL)"
 */
export const describeExamResult = (result: IExamTriggerResult, t: TFunction) =>
  [
    t("infectionControl.examTriggers.resultOn", {
      value: formatExamResult(result),
      date: formatDate(result.date, "DD/MM/YYYY HH:mm"),
    }),
    result.rawValue != null &&
      `(${t("infectionControl.examTriggers.rawValue", {
        value: [formatExamValue(result.rawValue), result.rawUnit]
          .filter(Boolean)
          .join(" "),
      })})`,
  ]
    .filter(Boolean)
    .join(" ");
