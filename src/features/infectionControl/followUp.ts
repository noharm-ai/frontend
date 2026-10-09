import dayjs, { Dayjs } from "dayjs";
import type { TFunction } from "react-i18next";

import { formatDate } from "utils/date";

import {
  AntimicrobialEvaluationClosingEnum,
  AntimicrobialEvaluationStatusEnum,
  InfectionControlPendingTypeEnum,
} from "models/InfectionControlEnum";

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

// reasons that take the verdict of an evaluation still on record out of force
const INVALIDATING_REASONS = [
  InfectionControlPendingTypeEnum.EXPIRED,
  InfectionControlPendingTypeEnum.POSOLOGY_CHANGED,
];

/**
 * The open reasons that make each evaluation of a running course no longer
 * hold (its validity ran out, the posology changed), by evaluation id: the
 * evaluation stays on record until a review replaces it, but its verdict no
 * longer stands
 */
export function getInvalidatedEvaluations(
  followUp: IFollowUp | null,
): Record<string, IFollowUpPending[]> {
  const invalidated: Record<string, IFollowUpPending[]> = {};

  (followUp?.courses ?? []).forEach((course) => {
    if (!course.ongoing || !course.evaluation) return;

    const reasons = (followUp?.pendings ?? []).filter(
      (pending) =>
        pending.idDrug === course.idDrug &&
        INVALIDATING_REASONS.includes(pending.type),
    );
    if (reasons.length) invalidated[course.evaluation.id] = reasons;
  });

  return invalidated;
}

/**
 * When an evaluation stopped holding: its validity ran out, or the course
 * moved to the posology it is on now. A reason keeps the details of when it
 * opened, so the change comes from the course; when the open time is all
 * there is, that.
 */
export function invalidatedSince(
  reasons: IFollowUpPending[],
  evaluation: IAntimicrobialEvaluation,
  course?: ICourse,
): string {
  const latestRegimen = course?.regimens.at(-1);

  return reasons
    .map((reason) => {
      if (reason.type === InfectionControlPendingTypeEnum.EXPIRED) {
        return reason.details?.validUntil ?? evaluation.validUntil;
      }
      if (
        latestRegimen &&
        dayjs(latestRegimen.start).isAfter(evaluation.createdAt)
      ) {
        return latestRegimen.start;
      }
      return reason.createdAt;
    })
    .reduce((first, date) => (dayjs(date).isBefore(first) ? date : first));
}

/** Why an evaluation no longer holds, in a few words ("posologia alterada") */
export const describeInvalidation = (
  reasons: IFollowUpPending[],
  evaluation: IAntimicrobialEvaluation,
  t: TFunction,
) =>
  reasons
    .map((reason) =>
      t(`infectionControl.evaluation.invalidated.${reason.type}`, {
        date: formatDate(reason.details?.validUntil ?? evaluation.validUntil),
      }),
    )
    .join(" · ");

export function isEvaluationExpired(
  evaluation: IAntimicrobialEvaluation,
  now: Dayjs,
) {
  return dayjs(evaluation.validUntil).isBefore(now);
}

// how an evaluation stopped being in force, or that it still is
// (retroactive: recorded for a period before the one in force, history only)
export type EvaluationOutcome =
  "valid" | "expired" | "superseded" | "closed" | "retroactive";

/**
 * Whether an evaluation over before the one in force starts: it is recorded
 * as history and leaves that one in force (backend save_review)
 */
export const endsBeforeInForce = (
  validUntil: string,
  inForce: IAntimicrobialEvaluation,
) => dayjs(validUntil).isBefore(inForce.validFrom);

/**
 * When an evaluation was in force: from its start (the review that recorded
 * it, or earlier when backdated) up to its valid-until date, or earlier, when
 * a newer evaluation replaced it or its course ended
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
  } else if (
    evaluation.closingType === AntimicrobialEvaluationClosingEnum.RETROACTIVE
  ) {
    outcome = "retroactive";
  } else if (evaluation.status === AntimicrobialEvaluationStatusEnum.CLOSED) {
    outcome = "closed";
  } else {
    outcome = isEvaluationExpired(evaluation, now) ? "expired" : "valid";
  }

  return {
    start: evaluation.validFrom,
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
