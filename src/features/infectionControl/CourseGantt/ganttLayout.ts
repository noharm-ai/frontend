import dayjs, { Dayjs } from "dayjs";

import { AntimicrobialEvaluationStatusEnum } from "models/InfectionControlEnum";

import {
  IAntimicrobialEvaluation,
  ICourse,
  IFollowUpPending,
} from "../InfectionControlSlice";
import {
  endsBeforeInForce,
  getEvaluationPeriod,
  invalidatedSince,
} from "../followUp";
import { ITimelineRange, packLanes, toPercent } from "../timeline";

/**
 * An evaluation being filled in the review modal, plotted before it is saved:
 * from its start (now unless backdated) up to its valid-until date
 */
export interface IDraftEvaluation {
  idDrug: number;
  courseStart: string;
  conforming: boolean | null;
  // null starts it now
  validFrom: string | null;
  // end of the chosen day, as it will be saved
  validUntil: string | null;
}

// left and width (percent) of the part of the timeline between two dates
export const span = (
  from: string | Dayjs,
  to: string | Dayjs,
  range: ITimelineRange,
) => {
  const left = toPercent(from, range);

  return {
    left: `${left}%`,
    width: `${Math.max(0, toPercent(to, range) - left)}%`,
  };
};

// the line under the course bar an evaluation is drawn on (0 is the first)
export const evaluationLaneStyle = (lane: number) =>
  ({ "--lane": lane }) as React.CSSProperties;

// records closer than this do not share a line, so their markers never
// collide and one replacing another (ending where it starts) stacks
const LANE_GAP_MS = 12 * 60 * 60 * 1000;

/**
 * Where an evaluation is drawn: from its start up to its end. One that no
 * longer holds keeps its verdict up to the first open reason (`since`) and is
 * pending from then on.
 */
export const getMarkSpan = (
  evaluation: IAntimicrobialEvaluation,
  invalidatedBy: IFollowUpPending[] | undefined,
  course: ICourse,
  now: Dayjs,
) => ({
  period: getEvaluationPeriod(evaluation, now),
  since: invalidatedBy?.length
    ? invalidatedSince(invalidatedBy, evaluation, course)
    : null,
});

// how far along the band the verdict holds, before the pending part
export const verdictSplit = (start: string, since: string, end: string) => {
  const total = dayjs(end).diff(start);
  const held = Math.min(dayjs(since).diff(start), total);

  return total > 0 ? `${(Math.max(0, held) / total) * 100}%` : "0%";
};

export interface IEvaluationMarkLayout {
  // as drawn: replaced from now on by the one being filled, when it is
  evaluation: IAntimicrobialEvaluation;
  invalidatedBy?: IFollowUpPending[];
  lane: number;
}

/**
 * The conformity records of a course on their lines, latest first: the one
 * being filled, then the newest saved and so on, each on the first line it
 * does not overlap
 */
export const layoutEvaluations = (
  evaluations: IAntimicrobialEvaluation[],
  draft: IDraftEvaluation | null | undefined,
  invalidatedEvaluations: Record<string, IFollowUpPending[]> | undefined,
  now: Dayjs,
): { marks: IEvaluationMarkLayout[]; draftLane: number; lanes: number } => {
  const marks = evaluations.map((evaluation) => {
    // the evaluation being filled replaces the one in force from now on,
    // unless it is over before that one starts (then it is history)
    const replaced =
      !!draft &&
      evaluation.status === AntimicrobialEvaluationStatusEnum.ACTIVE &&
      !(draft.validUntil && endsBeforeInForce(draft.validUntil, evaluation));

    return {
      evaluation: replaced
        ? {
            ...evaluation,
            status: AntimicrobialEvaluationStatusEnum.SUPERSEDED,
            closedAt: now.format("YYYY-MM-DDTHH:mm:ss"),
          }
        : evaluation,
      // what made it pending still shows, up to where the new one takes over
      invalidatedBy: invalidatedEvaluations?.[evaluation.id],
    };
  });

  const spans = marks.map((mark) => getEvaluationPeriod(mark.evaluation, now));
  const nowIso = now.format("YYYY-MM-DDTHH:mm:ss");
  const lanes = packLanes(
    draft
      ? [
          {
            start: draft.validFrom ?? nowIso,
            end: draft.validUntil ?? nowIso,
          },
          ...spans,
        ]
      : spans,
    LANE_GAP_MS,
  );
  const markLanes = draft ? lanes.slice(1) : lanes;

  return {
    marks: marks.map((mark, index) => ({ ...mark, lane: markLanes[index] })),
    draftLane: draft ? lanes[0] : 0,
    lanes: Math.max(1, ...lanes.map((lane) => lane + 1)),
  };
};
