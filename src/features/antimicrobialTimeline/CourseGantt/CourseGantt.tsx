import { useLayoutEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Tag, Tooltip } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { AwareTag } from "components/AwareTag/AwareTag";
import { formatDate } from "utils/date";

import { CourseStatus, ICourse } from "../AntimicrobialTimelineSlice";
import { CourseDetails } from "../CourseDetails/CourseDetails";
import { COURSE_COLORS } from "../courseColors";
import {
  formatRegimen,
  getTimelineRange,
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
}

/**
 * The bars of one course: solid for what was already given, light for what is
 * prescribed but still ahead, dashed up to the planned end, hatched on the days
 * the drug was not prescribed, with a tick on every regimen change
 */
function CourseBars({ course, range, now }: CourseBarsProps) {
  const { t } = useTranslation();

  const end = dayjs(course.end);
  const givenUntil = end.isAfter(now) ? now : end;
  const plannedEnd = course.plannedEnd ? dayjs(course.plannedEnd) : null;

  return (
    <>
      {plannedEnd && plannedEnd.isAfter(end) && (
        <Bar
          className="bar-planned"
          $color={COURSE_COLORS[course.status]}
          style={span(end, plannedEnd, range)}
        />
      )}

      <Tooltip title={<CourseDetails course={course} />} placement="top">
        <Bar
          className="bar-given"
          data-testid="course-bar"
          $color={COURSE_COLORS[course.status]}
          style={span(course.start, givenUntil, range)}
        />
      </Tooltip>

      {end.isAfter(now) && (
        <Tooltip title={<CourseDetails course={course} />} placement="top">
          <Bar className="bar-scheduled" style={span(now, end, range)} />
        </Tooltip>
      )}

      {course.gaps.map((gap) => (
        <Tooltip
          key={gap.start}
          title={t("antimicrobialTimeline.timeline.gap", {
            start: formatDate(gap.start, "DD/MM HH:mm"),
            end: formatDate(gap.end, "DD/MM HH:mm"),
          })}
        >
          <Bar className="bar-gap" style={span(gap.start, gap.end, range)} />
        </Tooltip>
      ))}

      {plannedEnd && (
        <Tooltip
          title={t("antimicrobialTimeline.timeline.plannedEnd", {
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
                {t("antimicrobialTimeline.timeline.regimenChange", {
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
    const trackWidth = el.scrollWidth - labelWidth;
    const todayX = labelWidth + (trackWidth * todayPercent) / 100;
    el.scrollLeft = Math.max(0, todayX - el.clientWidth * 0.7);
  }, [showToday, todayPercent]);

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
    <Gantt data-kb="antimicrobialTimeline.timeline">
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
                  {t("antimicrobialTimeline.timeline.today")}
                </span>
              )}
              {dischargePercent != null && (
                <span
                  className="marker-label marker-label-discharge"
                  style={{ left: `${dischargePercent}%` }}
                >
                  {t("antimicrobialTimeline.timeline.discharge")}
                </span>
              )}
            </Track>
          </Row>

          {courses.map((course) => (
            <Row
              key={`${course.idDrug}-${course.start}`}
              data-testid="course-row"
            >
              <RowLabel>
                <div className="label-drug">
                  <AwareTag level={course.atbLevel} />
                  <Tooltip title={course.substance || course.drug}>
                    <span className="label-name">{course.drug}</span>
                  </Tooltip>
                </div>
                <div className="label-info">
                  <Tag color={STATUS_TAG_COLORS[course.status]}>
                    {t(`antimicrobialTimeline.status.${course.status}`)}
                  </Tag>
                  <strong className="label-day">
                    {course.plannedDays != null
                      ? t("antimicrobialTimeline.timeline.dayPlanned", {
                          count: course.days,
                          planned: course.plannedDays,
                        })
                      : t("antimicrobialTimeline.timeline.day", {
                          count: course.days,
                        })}
                  </strong>
                  <span className="label-dates">
                    {formatDate(course.start, "DD/MM")} –{" "}
                    {formatDate(course.end, "DD/MM")}
                  </span>
                </div>
              </RowLabel>
              <Track $days={range.days.length}>
                <CourseBars course={course} range={range} now={now} />
                {markers}
              </Track>
            </Row>
          ))}
        </GanttGrid>
      </GanttScroll>

      <Legend>
        <span>
          <i className="legend-given" />
          {t("antimicrobialTimeline.timeline.legendActive")}
        </span>
        <span>
          <i className="legend-scheduled" />
          {t("antimicrobialTimeline.timeline.legendScheduled")}
        </span>
        <span>
          <i className="legend-planned" />
          {t("antimicrobialTimeline.timeline.legendPlanned")}
        </span>
        <span>
          <i className="legend-planned-end" />
          {t("antimicrobialTimeline.timeline.legendPlannedEnd")}
        </span>
        <span>
          <i className="legend-suspended" />
          {t("antimicrobialTimeline.timeline.legendSuspended")}
        </span>
        <span>
          <i className="legend-finished" />
          {t("antimicrobialTimeline.timeline.legendFinished")}
        </span>
        <span>
          <i className="legend-gap" />
          {t("antimicrobialTimeline.timeline.legendGap")}
        </span>
        <span>
          <i className="legend-change" />
          {t("antimicrobialTimeline.timeline.legendChange")}
        </span>
      </Legend>
    </Gantt>
  );
}
