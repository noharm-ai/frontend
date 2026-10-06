import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Tag, Tooltip } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { AwareTag } from "components/AwareTag/AwareTag";
import { formatDate } from "utils/date";

import { CourseStatus, ICourse } from "../InfectionControlSlice";
import { CourseDetails } from "../CourseDetails/CourseDetails";
import { COURSE_COLORS } from "../courseColors";
import {
  formatRegimen,
  getTimelineRange,
  groupCourseRows,
  ITimelineRange,
  toPercent,
} from "../timeline";
import {
  Bar,
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

interface CourseBarsProps {
  course: ICourse;
  range: ITimelineRange;
  now: Dayjs;
  // start of the next course of the same drug, which its planned end must not
  // run into
  nextStart?: string;
  onOpen: () => void;
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
  nextStart,
  onOpen,
}: CourseBarsProps) {
  const { t } = useTranslation();

  // the given and scheduled bars open the details of the course
  const clickable = {
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
  };

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
    </>
  );
}

/**
 * Gantt of the antimicrobial courses of an admission, one row per course, with
 * a line for today (and the discharge)
 */
export function CourseGantt({ courses, now, dischargeDate }: CourseGanttProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<ICourse | null>(null);

  const rows = useMemo(() => groupCourseRows(courses), [courses]);
  const range = useMemo(
    () => getTimelineRange(courses, dischargeDate ? dayjs(dischargeDate) : now),
    [courses, now, dischargeDate],
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
    <Gantt data-kb="infectionControl.antimicrobials.timeline">
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

          {rows.map(({ idDrug, course, courses: drugCourses }) => (
            <Row key={idDrug} data-testid="course-row">
              <RowLabel>
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
              </RowLabel>
              <Track $days={range.days.length}>
                {drugCourses.map((drugCourse, index) => (
                  <CourseBars
                    key={drugCourse.start}
                    course={drugCourse}
                    range={range}
                    now={now}
                    nextStart={drugCourses[index + 1]?.start}
                    onOpen={() => setSelected(drugCourse)}
                  />
                ))}
                {markers}
              </Track>
            </Row>
          ))}
        </GanttGrid>
      </GanttScroll>

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
      </Legend>

      <CourseDetails
        course={selected}
        now={now}
        onClose={() => setSelected(null)}
      />
    </Gantt>
  );
}
