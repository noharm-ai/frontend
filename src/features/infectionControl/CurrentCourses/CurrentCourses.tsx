import { useTranslation } from "react-i18next";
import { Progress } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { AwareTag } from "components/AwareTag/AwareTag";
import { formatDate } from "utils/date";

import { ICourse, IFollowUpCourse } from "../InfectionControlSlice";
import { COURSE_COLORS } from "../courseColors";
import { EvaluationTag } from "../EvaluationTag/EvaluationTag";
import { courseKey } from "../followUp";
import { daysSince, daysUntil, formatRegimen } from "../timeline";
import { CourseCard, CourseCards, EmptyCurrent } from "./CurrentCourses.style";

interface CurrentCoursesProps {
  // active courses only
  courses: ICourse[];
  now: Dayjs;
  // the infection control follow-up of each course (courseKey), when the
  // schema has it: each card then shows its evaluation
  followUps?: Record<string, IFollowUpCourse> | null;
}

interface PlannedEndProps {
  course: ICourse;
  now: Dayjs;
}

/** How far the planned end is: "ends in 3 days", or how long ago it passed */
function PlannedEndHint({ course, now }: PlannedEndProps) {
  const { t } = useTranslation();

  if (!course.plannedEnd) return null;

  if (dayjs(course.plannedEnd).isBefore(now)) {
    return (
      <span className="hint hint-overdue">
        {t("infectionControl.current.overdue", {
          count: Math.max(1, daysSince(course.plannedEnd, now)),
        })}
      </span>
    );
  }

  const left = daysUntil(course.plannedEnd, now);
  if (dayjs(course.plannedEnd).isSame(now, "day")) {
    return (
      <span className="hint hint-soon">
        {t("infectionControl.current.endsToday")}
      </span>
    );
  }

  return (
    <span className={`hint ${left <= 1 ? "hint-soon" : ""}`}>
      {t("infectionControl.current.endsIn", { count: left })}
    </span>
  );
}

/**
 * The antimicrobials in use right now, one card each: which treatment day it
 * is, how many were planned and when it should end
 */
export function CurrentCourses({
  courses,
  now,
  followUps,
}: CurrentCoursesProps) {
  const { t } = useTranslation();

  if (courses.length === 0) {
    return <EmptyCurrent>{t("infectionControl.current.empty")}</EmptyCurrent>;
  }

  return (
    <CourseCards>
      {courses.map((course) => {
        const regimen = course.regimens[course.regimens.length - 1];
        const overdue =
          !!course.plannedEnd && dayjs(course.plannedEnd).isBefore(now);

        return (
          <CourseCard
            key={`${course.idDrug}-${course.start}`}
            data-testid="current-course"
            $overdue={overdue}
          >
            <div className="course-header">
              <AwareTag level={course.atbLevel} />
              <span className="course-name" title={course.drug}>
                {course.drug}
              </span>
            </div>

            {followUps && (
              <div className="course-evaluation">
                <EvaluationTag
                  evaluation={
                    followUps[courseKey(course.idDrug, course.start)]
                      ?.evaluation ?? null
                  }
                  now={now}
                />
              </div>
            )}

            <div className="course-day">
              <span className="course-day-number">
                {t("infectionControl.timeline.day", {
                  count: course.days,
                })}
              </span>
              <span className="course-day-planned">
                {course.plannedDays != null
                  ? t("infectionControl.current.dayOf", {
                      count: course.plannedDays,
                    })
                  : t("infectionControl.current.noPlannedEnd")}
              </span>
            </div>

            {course.plannedDays != null && (
              <Progress
                percent={Math.min(
                  100,
                  (course.days / course.plannedDays) * 100,
                )}
                showInfo={false}
                size="small"
                strokeColor={
                  overdue ? COURSE_COLORS.suspended : COURSE_COLORS.active
                }
              />
            )}

            <dl className="course-dates">
              <div>
                <dt>{t("infectionControl.current.started")}</dt>
                <dd>{formatDate(course.start)}</dd>
              </div>
              {course.plannedEnd ? (
                <div>
                  <dt>{t("infectionControl.current.plannedEnd")}</dt>
                  <dd>
                    {formatDate(course.plannedEnd)}{" "}
                    <PlannedEndHint course={course} now={now} />
                  </dd>
                </div>
              ) : (
                <div>
                  <dt>{t("infectionControl.current.plannedEnd")}</dt>
                  <dd className="muted">
                    {t("infectionControl.current.validUntil", {
                      date: formatDate(course.end, "DD/MM HH:mm"),
                    })}
                  </dd>
                </div>
              )}
            </dl>

            {regimen && formatRegimen(regimen) && (
              <div className="course-regimen">
                <span className="label">
                  {t("infectionControl.current.regimen")}
                </span>
                {formatRegimen(regimen)}
              </div>
            )}
          </CourseCard>
        );
      })}
    </CourseCards>
  );
}
