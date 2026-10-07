import dayjs, { Dayjs } from "dayjs";
import type { TFunction } from "react-i18next";

import { AntimicrobialEvaluationStatusEnum } from "models/InfectionControlEnum";

import {
  IAntimicrobialEvaluation,
  ICourse,
  IFollowUp,
  IFollowUpCourse,
  IFollowUpPending,
} from "./InfectionControlSlice";

/**
 * The follow-up lists its courses by drug and start, the same key the
 * antimicrobial timeline uses (both are grouped by the backend the same way),
 * so this key places each evaluation on its course
 */
export const courseKey = (idDrug: number, start: string) =>
  `${idDrug}|${start}`;

export function getFollowUpCourses(
  followUp: IFollowUp | null,
): Record<string, IFollowUpCourse> {
  const map: Record<string, IFollowUpCourse> = {};

  (followUp?.courses ?? []).forEach((course) => {
    map[courseKey(course.idDrug, course.start)] = course;
  });

  return map;
}

/** Name of each drug of the timeline */
export function getDrugNames(courses: ICourse[]): Record<number, string> {
  const names: Record<number, string> = {};
  courses.forEach((course) => {
    names[course.idDrug] = course.drug;
  });

  return names;
}

export function isEvaluationExpired(
  evaluation: IAntimicrobialEvaluation,
  now: Dayjs,
) {
  return dayjs(evaluation.validUntil).isBefore(now);
}

// how an evaluation stopped being in force, or that it still is
export type EvaluationOutcome = "valid" | "expired" | "superseded" | "closed";

/**
 * When an evaluation was in force: from the review that recorded it up to
 * its valid-until date, or earlier, when a newer evaluation replaced it or its
 * course ended
 */
export function getEvaluationPeriod(
  evaluation: IAntimicrobialEvaluation,
  now: Dayjs,
): { start: string; end: string; outcome: EvaluationOutcome } {
  const closedEarly =
    evaluation.status !== AntimicrobialEvaluationStatusEnum.ACTIVE &&
    !!evaluation.closedAt &&
    dayjs(evaluation.closedAt).isBefore(evaluation.validUntil);

  let outcome: EvaluationOutcome;
  if (evaluation.status === AntimicrobialEvaluationStatusEnum.SUPERSEDED) {
    outcome = "superseded";
  } else if (evaluation.status === AntimicrobialEvaluationStatusEnum.CLOSED) {
    outcome = "closed";
  } else {
    outcome = isEvaluationExpired(evaluation, now) ? "expired" : "valid";
  }

  return {
    start: evaluation.createdAt,
    end: closedEarly ? evaluation.closedAt! : evaluation.validUntil,
    outcome,
  };
}

/** What a pending reason is about, in words */
export function describePending(
  pending: IFollowUpPending,
  drugNames: Record<number, string>,
  t: TFunction,
) {
  const drug =
    pending.details?.drug ??
    (pending.idDrug != null ? drugNames[pending.idDrug] : undefined) ??
    t("infectionControl.followUp.unknownDrug");

  return t(`infectionControl.followUp.pending.${pending.type}`, { drug });
}
