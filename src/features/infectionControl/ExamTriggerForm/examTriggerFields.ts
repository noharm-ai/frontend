import * as Yup from "yup";
import type { TFunction } from "i18next";

import {
  IExamTriggerRule,
  IExamTriggerRulePayload,
} from "../InfectionControlSlice";

// how many rules a schema can have (the backend refuses more)
export const MAX_RULES = 50;

// how a condition compares: > >= < <=
export type ConditionOperator = "above" | "atLeast" | "below" | "atMost";

export const OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: "above", label: ">" },
  { value: "atLeast", label: "≥" },
  { value: "below", label: "<" },
  { value: "atMost", label: "≤" },
];

// the field of a rule each operator sets, for the value and the variation
const VALUE_FIELDS = {
  above: "valueAbove",
  atLeast: "valueAtLeast",
  below: "valueBelow",
  atMost: "valueAtMost",
} as const;
const VARIATION_FIELDS = {
  above: "variationAbove",
  atLeast: "variationAtLeast",
  below: "variationBelow",
  atMost: "variationAtMost",
} as const;

/**
 * A rule as the form edits it: one condition on the value and one on the
 * variation from the result at review time, each with its operator. A fall
 * is a negative variation ("< -25%").
 */
export interface IExamTriggerFormFields {
  // absent for a new rule
  id?: string;
  name: string;
  examRef: string | null;
  valueOperator: ConditionOperator;
  value: number | null;
  variationOperator: ConditionOperator;
  variation: number | null;
  fromCourseDay: number | null;
  enabledByDefault: boolean;
}

// the operator and the number of the condition a rule sets, the first one
// when it sets more (the form edits one of each kind)
const pickCondition = (
  rule: IExamTriggerRule,
  fields: Record<ConditionOperator, keyof IExamTriggerRule>,
  fallback: ConditionOperator,
): { operator: ConditionOperator; value: number | null } => {
  const operator = OPERATORS.map((option) => option.value).find(
    (option) => rule[fields[option]] != null,
  );

  return operator
    ? { operator, value: rule[fields[operator]] as number }
    : { operator: fallback, value: null };
};

/** The form of a rule, empty for a new one */
export const toFormFields = (
  rule: IExamTriggerRule | null,
): IExamTriggerFormFields => {
  if (!rule) {
    return {
      name: "",
      examRef: null,
      valueOperator: "above",
      value: null,
      variationOperator: "above",
      variation: null,
      fromCourseDay: null,
      enabledByDefault: false,
    };
  }

  const value = pickCondition(rule, VALUE_FIELDS, "above");
  const variation = pickCondition(rule, VARIATION_FIELDS, "above");

  return {
    id: rule.id,
    name: rule.name,
    examRef: rule.examRef,
    valueOperator: value.operator,
    value: value.value,
    variationOperator: variation.operator,
    variation: variation.value,
    fromCourseDay: rule.fromCourseDay,
    enabledByDefault: rule.enabledByDefault,
  };
};

/** A rule as saved, from the form */
export const toRulePayload = (
  fields: IExamTriggerFormFields,
): IExamTriggerRulePayload => {
  const conditions = {
    valueAbove: null,
    valueAtLeast: null,
    valueBelow: null,
    valueAtMost: null,
    variationAbove: null,
    variationAtLeast: null,
    variationBelow: null,
    variationAtMost: null,
  } as Record<
    | (typeof VALUE_FIELDS)[ConditionOperator]
    | (typeof VARIATION_FIELDS)[ConditionOperator],
    number | null
  >;
  if (fields.value != null) {
    conditions[VALUE_FIELDS[fields.valueOperator]] = fields.value;
  }
  if (fields.variation != null) {
    conditions[VARIATION_FIELDS[fields.variationOperator]] = fields.variation;
  }

  return {
    ...(fields.id ? { id: fields.id } : {}),
    name: fields.name.trim(),
    examRef: fields.examRef!,
    ...conditions,
    fromCourseDay: fields.fromCourseDay,
    enabledByDefault: fields.enabledByDefault,
  };
};

/** A rule of the list as saved again, unchanged */
export const ruleToPayload = ({
  available: _,
  ...rule
}: IExamTriggerRule): IExamTriggerRulePayload => rule;

/** The checks the backend makes on a rule */
export const getValidationSchema = (t: TFunction) =>
  Yup.object()
    .shape({
      name: Yup.string()
        .trim()
        .required(t("validation.requiredField"))
        .max(100, t("infectionControl.examTriggers.settings.nameTooLong")),
      examRef: Yup.string().nullable().required(t("validation.requiredField")),
      value: Yup.number().nullable(),
      variation: Yup.number().nullable(),
      fromCourseDay: Yup.number()
        .nullable()
        .integer(t("infectionControl.examTriggers.settings.fromCourseDayMin"))
        .min(1, t("infectionControl.examTriggers.settings.fromCourseDayMin")),
    })
    // at least one condition
    .test("condition", function (fields) {
      if (fields.value != null || fields.variation != null) return true;

      return this.createError({
        path: "value",
        message: t("infectionControl.examTriggers.settings.conditionRequired"),
      });
    });
