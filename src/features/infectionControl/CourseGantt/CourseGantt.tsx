import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Tag, Tooltip } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { AwareTag } from "components/AwareTag/AwareTag";
import { formatDate } from "utils/date";

import {
  CourseStatus,
  IAntimicrobialEvaluation,
  ICourse,
  IFollowUpCourse,
  IFollowUpPending,
} from "../InfectionControlSlice";
import { CourseDetails } from "../CourseDetails/CourseDetails";
import { COURSE_COLORS } from "../courseColors";
import {
  courseKey,
  describeInvalidation,
  endsBeforeInForce,
  getEvaluationPeriod,
  invalidatedSince,
} from "../followUp";
import { AntimicrobialEvaluationStatusEnum } from "models/InfectionControlEnum";
import {
  formatRegimen,
  getTimelineRange,
  groupCourseRows,
  ITimelineRange,
  packLanes,
  toPercent,
} from "../timeline";
import {
  Bar,
  DAY_WIDTH,
  Evaluation,
  Gantt,
  GanttGrid,
  GanttScroll,
  HeaderDay,
  Legend,
  Marker,
  Row,
  RowLabel,
  Track,
} from "./CourseGantt.style";

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

interface CourseGanttProps {
  courses: ICourse[];
  now: Dayjs;
  dischargeDate: string | null;
  // the follow-up of each course (courseKey), when the schema has the feature
  followUps?: Record<string, IFollowUpCourse> | null;
  // the open reasons that make an evaluation no longer hold, by evaluation id
  // (getInvalidatedEvaluations)
  invalidatedEvaluations?: Record<string, IFollowUpPending[]>;
  // embedded in another view (the review modal): no legend and no details
  compact?: boolean;
  // the evaluation being filled, if any
  draftEvaluation?: IDraftEvaluation | null;
}

const STATUS_TAG_COLORS: Record<CourseStatus, string> = {
  active: "blue",
  suspended: "red",
  finished: "default",
};

// left and width (percent) of the part of the timeline between two dates
const span = (
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
const evaluationLaneStyle = (lane: number) =>
  ({ "--lane": lane }) as React.CSSProperties;

// records closer than this do not share a line, so their markers never
// collide and one replacing another (ending where it starts) stacks
const LANE_GAP_MS = 12 * 60 * 60 * 1000;

/**
 * Where an evaluation is drawn: from its start up to its end, or up to the
 * first open reason that made it no longer hold (`since`)
 */
const getMarkSpan = (
  evaluation: IAntimicrobialEvaluation,
  invalidatedBy: IFollowUpPending[] | undefined,
  course: ICourse,
  now: Dayjs,
) => {
  const period = getEvaluationPeriod(evaluation, now);
  const since = invalidatedBy?.length
    ? invalidatedSince(invalidatedBy, evaluation, course)
    : null;

  return {
    period,
    since,
    start: period.start,
    end: since && dayjs(since).isBefore(period.end) ? since : period.end,
  };
};

interface IEvaluationMarkLayout {
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
const layoutEvaluations = (
  course: ICourse,
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
      invalidatedBy: replaced
        ? undefined
        : invalidatedEvaluations?.[evaluation.id],
    };
  });

  const spans = marks.map((mark) =>
    getMarkSpan(mark.evaluation, mark.invalidatedBy, course, now),
  );
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

interface CourseBarsProps {
  course: ICourse;
  range: ITimelineRange;
  now: Dayjs;
  // the conformity records of the course on their lines (layoutEvaluations)
  evaluations: IEvaluationMarkLayout[];
  // the evaluation being filled for this course, and its line
  draft?: IDraftEvaluation | null;
  draftLane?: number;
  // start of the next course of the same drug, which its planned end must not
  // run into
  nextStart?: string;
  // opens the details of the course; without it the bars are not clickable
  onOpen?: () => void;
}

/**
 * The bars of one course: solid for what was already given, light for what is
 * prescribed but still ahead, dashed up to the planned end, hatched on the days
 * the drug was not prescribed, with a tick on every regimen change
 */
function CourseBars({
  course,
  range,
  now,
  evaluations,
  draft,
  draftLane = 0,
  nextStart,
  onOpen,
}: CourseBarsProps) {
  const { t } = useTranslation();

  // the given and scheduled bars open the details of the course
  const clickable = onOpen
    ? {
        role: "button",
        tabIndex: 0,
        "aria-label": t("infectionControl.timeline.openDetails", {
          drug: course.drug,
        }),
        onClick: onOpen,
        onKeyDown: (event: React.KeyboardEvent) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen();
          }
        },
      }
    : {};

  const end = dayjs(course.end);
  const givenUntil = end.isAfter(now) ? now : end;
  const plannedEnd = course.plannedEnd ? dayjs(course.plannedEnd) : null;
  // a past course stops being planned once the drug is prescribed again
  const plannedUntil =
    plannedEnd && nextStart && plannedEnd.isAfter(nextStart)
      ? dayjs(nextStart)
      : plannedEnd;

  return (
    <>
      {plannedUntil && plannedUntil.isAfter(end) && (
        <Bar
          className="bar-planned"
          $color={COURSE_COLORS[course.status]}
          style={span(end, plannedUntil, range)}
        />
      )}

      <Bar
        className="bar-given"
        data-testid="course-bar"
        $color={COURSE_COLORS[course.status]}
        style={span(course.start, givenUntil, range)}
        {...clickable}
      />

      {end.isAfter(now) && (
        <Bar
          className="bar-scheduled"
          style={span(now, end, range)}
          {...clickable}
        />
      )}

      {course.gaps.map((gap) => (
        <Tooltip
          key={gap.start}
          title={t("infectionControl.timeline.gap", {
            start: formatDate(gap.start, "DD/MM HH:mm"),
            end: formatDate(gap.end, "DD/MM HH:mm"),
          })}
        >
          <Bar className="bar-gap" style={span(gap.start, gap.end, range)} />
        </Tooltip>
      ))}

      {plannedEnd && plannedEnd === plannedUntil && (
        <Tooltip
          title={t("infectionControl.timeline.plannedEnd", {
            date: formatDate(course.plannedEnd, "DD/MM HH:mm"),
          })}
        >
          <span
            className="planned-end"
            data-testid="planned-end"
            style={{ left: `${toPercent(plannedEnd, range)}%` }}
          />
        </Tooltip>
      )}

      {course.regimens.slice(1).map((regimen, index) => (
        <Tooltip
          key={`${regimen.start}-${index}`}
          title={
            <>
              <div>
                {t("infectionControl.timeline.regimenChange", {
                  date: formatDate(regimen.start, "DD/MM HH:mm"),
                })}
              </div>
              <strong>{formatRegimen(regimen)}</strong>
            </>
          }
        >
          <span
            className="regimen-change"
            style={{ left: `${toPercent(regimen.start, range)}%` }}
          />
        </Tooltip>
      ))}

      {evaluations.map(({ evaluation, invalidatedBy, lane }) => (
        <EvaluationMark
          key={evaluation.id}
          lane={lane}
          evaluation={evaluation}
          course={course}
          invalidatedBy={invalidatedBy}
          range={range}
          now={now}
        />
      ))}

      {draft && (
        <DraftEvaluationMark
          draft={draft}
          lane={draftLane}
          range={range}
          now={now}
        />
      )}
    </>
  );
}

interface DraftEvaluationMarkProps {
  draft: IDraftEvaluation;
  // its line under the course bar (evaluationLaneStyle)
  lane: number;
  range: ITimelineRange;
  now: Dayjs;
}

/**
 * The evaluation being filled, drawn as it is chosen: a dot today once there
 * is a verdict, a band up to the valid-until date once there is one, grey
 * until the verdict comes
 */
function DraftEvaluationMark({
  draft,
  lane,
  range,
  now,
}: DraftEvaluationMarkProps) {
  const { t } = useTranslation();

  if (draft.conforming == null && !draft.validUntil) return null;

  const verdict =
    draft.conforming == null
      ? null
      : t(
          draft.conforming
            ? "infectionControl.evaluation.conforming"
            : "infectionControl.evaluation.nonConforming",
        );
  const colorClass =
    draft.conforming == null
      ? "undecided"
      : draft.conforming
        ? "conforming"
        : "non-conforming";

  return (
    <Tooltip
      title={
        <>
          <strong>{t("infectionControl.timeline.evaluation.draft")}</strong>
          {verdict && <div>{verdict}</div>}
          {draft.validFrom && (
            <div>
              {t("infectionControl.timeline.evaluation.from", {
                date: formatDate(draft.validFrom, "DD/MM HH:mm"),
              })}
            </div>
          )}
          {draft.validUntil && (
            <div>
              {t("infectionControl.timeline.evaluation.valid", {
                date: formatDate(draft.validUntil),
              })}
            </div>
          )}
        </>
      }
    >
      <Evaluation
        className={`draft ${colorClass}`}
        data-testid="draft-evaluation"
        tabIndex={0}
        aria-label={t("infectionControl.timeline.evaluation.draft")}
        style={{
          ...span(draft.validFrom ?? now, draft.validUntil ?? now, range),
          ...evaluationLaneStyle(lane),
        }}
      />
    </Tooltip>
  );
}

interface EvaluationMarkProps {
  evaluation: IAntimicrobialEvaluation;
  // its line under the course bar (evaluationLaneStyle)
  lane: number;
  course: ICourse;
  // open reasons that make it no longer hold
  invalidatedBy?: IFollowUpPending[];
  range: ITimelineRange;
  now: Dayjs;
}

/**
 * A conformity record on its course: a dot on the day of the review and a band
 * under the bar for as long as the evaluation was (or is) in force, green when
 * conforming and red when not. One that no longer holds (expired, posology
 * changed) stops at the first open reason, in the pending color.
 */
function EvaluationMark({
  evaluation,
  lane,
  course,
  invalidatedBy,
  range,
  now,
}: EvaluationMarkProps) {
  const { t } = useTranslation();
  const { period, since, end } = getMarkSpan(
    evaluation,
    invalidatedBy,
    course,
    now,
  );
  // dated back to before the review that recorded it
  const backdated = dayjs(evaluation.validFrom).isBefore(
    dayjs(evaluation.createdAt).subtract(1, "minute"),
  );
  const verdict = t(
    evaluation.conforming
      ? "infectionControl.evaluation.conforming"
      : "infectionControl.evaluation.nonConforming",
  );
  const posology = formatRegimen(evaluation.posology);

  return (
    <Tooltip
      title={
        <>
          <strong>{verdict}</strong>
          <div>
            {t("infectionControl.timeline.evaluation.by", {
              date: formatDate(evaluation.createdAt, "DD/MM HH:mm"),
              user: evaluation.createdBy ?? "-",
            })}
          </div>
          {backdated && (
            <div>
              {t("infectionControl.timeline.evaluation.from", {
                date: formatDate(evaluation.validFrom, "DD/MM HH:mm"),
              })}
            </div>
          )}
          <div>
            {since
              ? t("infectionControl.timeline.evaluation.invalidated", {
                  date: formatDate(since, "DD/MM HH:mm"),
                  reasons: describeInvalidation(invalidatedBy!, evaluation, t),
                })
              : t(`infectionControl.timeline.evaluation.${period.outcome}`, {
                  date: formatDate(
                    period.outcome === "valid" ||
                      period.outcome === "expired" ||
                      period.outcome === "retroactive"
                      ? evaluation.validUntil
                      : (evaluation.closedAt ?? period.end),
                  ),
                })}
          </div>
          {posology && (
            <div>
              {t("infectionControl.timeline.evaluation.posology", {
                posology,
              })}
            </div>
          )}
          {evaluation.notes && <em>{evaluation.notes}</em>}
        </>
      }
    >
      <Evaluation
        className={[
          evaluation.conforming ? "conforming" : "non-conforming",
          // one that no longer holds takes the pending color instead
          period.outcome === "valid" || since ? "" : "past",
          since ? "invalidated" : "",
        ].join(" ")}
        data-testid="course-evaluation"
        tabIndex={0}
        aria-label={t("infectionControl.timeline.evaluation.label", {
          verdict,
          date: formatDate(evaluation.createdAt),
        })}
        style={{
          ...span(period.start, end, range),
          ...evaluationLaneStyle(lane),
        }}
      />
    </Tooltip>
  );
}

/**
 * Gantt of the antimicrobial courses of an admission, one row per course, with
 * a line for today (and the discharge)
 */
export function CourseGantt({
  courses,
  now,
  dischargeDate,
  followUps,
  invalidatedEvaluations,
  compact = false,
  draftEvaluation,
}: CourseGanttProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<ICourse | null>(null);

  const evaluationsOf = (course: ICourse) =>
    followUps?.[courseKey(course.idDrug, course.start)]?.history ?? [];
  const draftOf = (course: ICourse) =>
    draftEvaluation &&
    draftEvaluation.idDrug === course.idDrug &&
    draftEvaluation.courseStart === course.start
      ? draftEvaluation
      : null;

  const rows = useMemo(() => groupCourseRows(courses), [courses]);
  const range = useMemo(
    () =>
      getTimelineRange(
        courses,
        dischargeDate ? dayjs(dischargeDate) : now,
        // the timeline reaches the end of the evaluations still in force,
        // and of the one being filled
        [
          ...Object.values(followUps ?? {}).map(
            (followUp) => followUp.evaluation?.validUntil,
          ),
          draftEvaluation?.validUntil,
        ].filter((date): date is string => !!date),
      ),
    [courses, now, dischargeDate, followUps, draftEvaluation?.validUntil],
  );
  const todayPercent = toPercent(now, range);
  const showToday = now.isAfter(range.start) && now.isBefore(range.end);
  const dischargePercent = dischargeDate
    ? toPercent(dischargeDate, range)
    : null;

  // long admissions overflow sideways: open with today in sight
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !showToday) return;

    const labelWidth =
      el.querySelector<HTMLElement>("[data-row-label]")?.offsetWidth ?? 0;
    const trackWidth = range.days.length * DAY_WIDTH;
    const todayX = labelWidth + (trackWidth * todayPercent) / 100;
    el.scrollLeft = Math.max(0, todayX - el.clientWidth * 0.7);
  }, [showToday, todayPercent, range.days.length]);

  const markers = (
    <>
      {showToday && (
        <Marker className="marker-today" style={{ left: `${todayPercent}%` }} />
      )}
      {dischargePercent != null && (
        <Marker
          className="marker-discharge"
          style={{ left: `${dischargePercent}%` }}
        />
      )}
    </>
  );

  return (
    <Gantt
      className={compact ? "compact" : undefined}
      data-kb={compact ? undefined : "infectionControl.antimicrobials.timeline"}
    >
      <GanttScroll ref={scrollRef}>
        <GanttGrid
          style={{
            minWidth: `calc(var(--label-width) + ${range.days.length * DAY_WIDTH}px)`,
          }}
        >
          <Row className="row-header">
            <RowLabel data-row-label />
            <Track $days={range.days.length} className="track-header">
              {range.days.map((day, index) => (
                <HeaderDay
                  key={day.valueOf()}
                  className={[
                    day.isSame(now, "day") ? "today" : "",
                    day.day() === 0 || day.day() === 6 ? "weekend" : "",
                    index === 0 || day.date() === 1 ? "month-start" : "",
                  ].join(" ")}
                >
                  <span className="day-number">{day.format("DD")}</span>
                  <span className="day-month">{day.format("MMM")}</span>
                </HeaderDay>
              ))}
              {showToday && (
                <span
                  className="marker-label marker-label-today"
                  style={{ left: `${todayPercent}%` }}
                >
                  {t("infectionControl.timeline.today")}
                </span>
              )}
              {dischargePercent != null && (
                <span
                  className="marker-label marker-label-discharge"
                  style={{ left: `${dischargePercent}%` }}
                >
                  {t("infectionControl.timeline.discharge")}
                </span>
              )}
            </Track>
          </Row>

          {rows.map(({ idDrug, course, courses: drugCourses }) => {
            const dayLabel = (
              <strong className="label-day">
                {course.plannedDays != null
                  ? t("infectionControl.timeline.dayPlanned", {
                      count: course.days,
                      planned: course.plannedDays,
                    })
                  : t("infectionControl.timeline.day", {
                      count: course.days,
                    })}
              </strong>
            );

            const layouts = drugCourses.map((drugCourse) =>
              layoutEvaluations(
                drugCourse,
                evaluationsOf(drugCourse),
                draftOf(drugCourse),
                invalidatedEvaluations,
                now,
              ),
            );
            // the row grows to fit the lines of its busiest course
            const lanes = Math.max(...layouts.map((layout) => layout.lanes));

            return (
              <Row
                key={idDrug}
                data-testid="course-row"
                style={{ "--lanes": lanes } as React.CSSProperties}
              >
                <RowLabel>
                  {compact ? (
                    // the view around it already names the drug
                    dayLabel
                  ) : (
                    <>
                      <div className="label-drug">
                        <AwareTag level={course.atbLevel} />
                        <Tooltip title={course.substance || course.drug}>
                          <button
                            type="button"
                            className="label-name"
                            onClick={() => setSelected(course)}
                          >
                            {course.drug}
                          </button>
                        </Tooltip>
                      </div>
                      <div className="label-info">
                        <Tag color={STATUS_TAG_COLORS[course.status]}>
                          {t(`infectionControl.status.${course.status}`)}
                        </Tag>
                        {dayLabel}
                        <span className="label-dates">
                          {formatDate(course.start, "DD/MM")} –{" "}
                          {formatDate(course.end, "DD/MM")}
                        </span>
                      </div>
                      {drugCourses.length > 1 && (
                        <div className="label-cycles">
                          {t("infectionControl.timeline.otherCourses", {
                            count: drugCourses.length - 1,
                          })}
                        </div>
                      )}
                    </>
                  )}
                </RowLabel>
                <Track $days={range.days.length}>
                  {drugCourses.map((drugCourse, index) => (
                    <CourseBars
                      key={drugCourse.start}
                      course={drugCourse}
                      range={range}
                      now={now}
                      evaluations={layouts[index].marks}
                      draft={draftOf(drugCourse)}
                      draftLane={layouts[index].draftLane}
                      nextStart={drugCourses[index + 1]?.start}
                      onOpen={
                        compact ? undefined : () => setSelected(drugCourse)
                      }
                    />
                  ))}
                  {markers}
                </Track>
              </Row>
            );
          })}
        </GanttGrid>
      </GanttScroll>

      {!compact && (
        <Legend>
          <span>
            <i className="legend-given" />
            {t("infectionControl.timeline.legendActive")}
          </span>
          <span>
            <i className="legend-scheduled" />
            {t("infectionControl.timeline.legendScheduled")}
          </span>
          <span>
            <i className="legend-planned" />
            {t("infectionControl.timeline.legendPlanned")}
          </span>
          <span>
            <i className="legend-planned-end" />
            {t("infectionControl.timeline.legendPlannedEnd")}
          </span>
          <span>
            <i className="legend-suspended" />
            {t("infectionControl.timeline.legendSuspended")}
          </span>
          <span>
            <i className="legend-finished" />
            {t("infectionControl.timeline.legendFinished")}
          </span>
          <span>
            <i className="legend-gap" />
            {t("infectionControl.timeline.legendGap")}
          </span>
          <span>
            <i className="legend-change" />
            {t("infectionControl.timeline.legendChange")}
          </span>
          {followUps && (
            <>
              <span>
                <i className="legend-evaluation conforming" />
                {t("infectionControl.timeline.legendConforming")}
              </span>
              <span>
                <i className="legend-evaluation non-conforming" />
                {t("infectionControl.timeline.legendNonConforming")}
              </span>
              <span>
                <i className="legend-evaluation conforming invalidated" />
                {t("infectionControl.timeline.legendInvalidated")}
              </span>
            </>
          )}
        </Legend>
      )}

      {!compact && (
        <CourseDetails
          course={selected}
          now={now}
          onClose={() => setSelected(null)}
        />
      )}
    </Gantt>
  );
}
