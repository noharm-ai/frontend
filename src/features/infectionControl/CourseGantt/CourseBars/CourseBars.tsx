import { useTranslation } from "react-i18next";
import { Tooltip } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { formatDate } from "utils/date";

import { ICourse } from "../../InfectionControlSlice";
import { COURSE_COLORS } from "../../courseColors";
import { formatRegimen, ITimelineRange, toPercent } from "../../timeline";
import { DraftEvaluationMark } from "../DraftEvaluationMark/DraftEvaluationMark";
import { EvaluationMark } from "../EvaluationMark/EvaluationMark";
import { IDraftEvaluation, IEvaluationMarkLayout, span } from "../ganttLayout";
import { Bar } from "../CourseGantt.style";

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
export function CourseBars({
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
