import type { TFunction } from "i18next";

/**
 * Names of the indication codes the report answers: the treatment types
 * ("none" when not informed) and the infection foci, with the labels of the
 * infection control review.
 */

export const NOT_INFORMED = "none";

// a treatment type key ("1"-"4" or "none") or code by name
export const treatmentTypeName = (
  key: string | number | null | undefined,
  t: TFunction,
) =>
  key == null || key === NOT_INFORMED
    ? t("infectionControlConsolidated.indication.notInformed")
    : t(`infectionControl.indication.treatmentTypes.${key}`, {
        defaultValue: `${key}`,
      });

export const focusName = (focus: number, t: TFunction) =>
  t(`infectionControl.indication.foci.${focus}`, { defaultValue: `${focus}` });

// a share of a total, null without one
export const shareOf = (value: number | undefined, total: number) =>
  total ? (value || 0) / total : null;
