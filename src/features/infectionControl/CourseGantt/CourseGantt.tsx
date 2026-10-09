import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Tag, Tooltip } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { AwareTag } from "components/AwareTag/AwareTag";
import { formatDate } from "utils/date";
import { AntimicrobialEvaluationStatusEnum } from "models/InfectionControlEnum";

import {
  CourseStatus,
  IAntimicrobialEvaluation,
  ICourse,
  IFollowUpCourse,
  IFollowUpPending,
} from "../InfectionControlSlice";
import { CourseDetails } from "../CourseDetails/CourseDetails";
import { courseKey } from "../followUp";
import { getTimelineRange, groupCourseRows, toPercent } from "../timeline";
import { CourseBars } from "./CourseBars/CourseBars";
import { IDraftEvaluation, layoutEvaluations } from "./ganttLayout";
import {
  DAY_WIDTH,
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
  const [showSuperseded, setShowSuperseded] = useState(false);

  const isSuperseded = (evaluation: IAntimicrobialEvaluation) =>
    evaluation.status === AntimicrobialEvaluationStatusEnum.SUPERSEDED;
  const historyOf = (course: ICourse) =>
    followUps?.[courseKey(course.idDrug, course.start)]?.history ?? [];
  // the main timeline leaves out the records a newer one replaced, unless
  // asked for them; embedded, it shows them all
  const supersededCount = compact
    ? 0
    : courses.reduce(
        (count, course) =>
          count + historyOf(course).filter(isSuperseded).length,
        0,
      );
  const evaluationsOf = (course: ICourse) =>
    supersededCount > 0 && !showSuperseded
      ? historyOf(course).filter((evaluation) => !isSuperseded(evaluation))
      : historyOf(course);
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
          {supersededCount > 0 && (
            <Button
              type="link"
              size="small"
              className="legend-toggle"
              data-testid="toggle-superseded"
              aria-pressed={showSuperseded}
              onClick={() => setShowSuperseded((shown) => !shown)}
            >
              {showSuperseded
                ? t("infectionControl.timeline.hideSuperseded")
                : t("infectionControl.timeline.showSuperseded", {
                    count: supersededCount,
                  })}
            </Button>
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
