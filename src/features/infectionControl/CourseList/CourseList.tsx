import { ReactNode, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { Dayjs } from "dayjs";

import { AwareTag } from "components/AwareTag/AwareTag";
import DrugAlertLevelTag from "components/DrugAlertLevelTag";
import { formatDate } from "utils/date";

import {
  CourseStatus,
  ICourse,
  IFollowUpCourse,
  IFollowUpPending,
} from "../InfectionControlSlice";
import { CourseDetails } from "../CourseDetails/CourseDetails";
import { EvaluationTag } from "../EvaluationTag/EvaluationTag";
import { courseKey } from "../followUp";
import { groupCourseRows } from "../timeline";
import { CourseCard, CourseListBox } from "./CourseList.style";

interface CourseListProps {
  courses: ICourse[];
  now: Dayjs;
  // the follow-up of each course (courseKey), when the schema has the feature
  followUps?: Record<string, IFollowUpCourse> | null;
  // the open reasons that make an evaluation no longer hold, by evaluation id
  invalidatedEvaluations?: Record<string, IFollowUpPending[]>;
  // next to the title
  actions?: ReactNode;
}

const STATUS_TAG_COLORS: Record<CourseStatus, string> = {
  active: "blue",
  suspended: "red",
  finished: "default",
};

/**
 * The antimicrobial courses on phones, where the timeline is too wide to
 * read: one card per drug, as the timeline rows, with its day of treatment
 * and current evaluation. A card opens the details of its course
 */
export function CourseList({
  courses,
  now,
  followUps,
  invalidatedEvaluations,
  actions,
}: CourseListProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<ICourse | null>(null);
  const rows = useMemo(() => groupCourseRows(courses), [courses]);

  return (
    <CourseListBox data-kb="infectionControl.antimicrobials.list">
      <header>
        <h2 className="section-title">
          {t("infectionControl.timeline.listTitle")}
        </h2>
        {actions}
      </header>

      {rows.map(({ idDrug, course, courses: drugCourses }) => {
        const followUp = followUps?.[courseKey(course.idDrug, course.start)];
        const evaluation = followUp?.evaluation ?? null;
        // a course nobody has to evaluate any more says nothing about it
        const showEvaluation = !!followUp && (!!evaluation || followUp.ongoing);

        return (
          <CourseCard
            key={idDrug}
            type="button"
            data-testid="course-card"
            onClick={() => setSelected(course)}
          >
            <div className="card-body">
              <div className="card-drug">
                <AwareTag level={course.atbLevel} />
                <span className="card-name">{course.drug}</span>
              </div>
              <div className="card-info">
                <Tag color={STATUS_TAG_COLORS[course.status]}>
                  {t(`infectionControl.status.${course.status}`)}
                </Tag>
                {!!course.alerts?.length && (
                  <span data-testid="course-alerts">
                    <DrugAlertLevelTag
                      levels={course.alerts.map((alert) => alert.level)}
                      count={course.alerts.length}
                    />
                  </span>
                )}
                <strong className="card-day">
                  {course.plannedDays != null
                    ? t("infectionControl.timeline.dayPlanned", {
                        count: course.days,
                        planned: course.plannedDays,
                      })
                    : t("infectionControl.timeline.day", {
                        count: course.days,
                      })}
                </strong>
                <span className="muted">
                  {formatDate(course.start, "DD/MM")} –{" "}
                  {formatDate(course.end, "DD/MM")}
                </span>
              </div>
              {showEvaluation && (
                <div className="card-evaluation">
                  <EvaluationTag
                    evaluation={evaluation}
                    now={now}
                    invalidatedBy={
                      evaluation
                        ? invalidatedEvaluations?.[evaluation.id]
                        : undefined
                    }
                  />
                </div>
              )}
              {drugCourses.length > 1 && (
                <div className="muted">
                  {t("infectionControl.timeline.otherCourses", {
                    count: drugCourses.length - 1,
                  })}
                </div>
              )}
            </div>
            <RightOutlined className="card-open" />
          </CourseCard>
        );
      })}

      <CourseDetails
        course={selected}
        now={now}
        onClose={() => setSelected(null)}
      />
    </CourseListBox>
  );
}
