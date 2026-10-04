import { useTranslation } from "react-i18next";

import { formatDateTime } from "utils/date";

import { ICourse } from "../AntimicrobialTimelineSlice";
import { formatRegimen } from "../timeline";
import { Details } from "./CourseDetails.style";

interface CourseDetailsProps {
  course: ICourse;
}

/** Everything about one course, shown when hovering its bar */
export function CourseDetails({ course }: CourseDetailsProps) {
  const { t } = useTranslation();

  return (
    <Details>
      <div className="details-title">{course.drug}</div>
      {course.substance && (
        <div className="details-subtitle">{course.substance}</div>
      )}

      <dl>
        <dt>{t("antimicrobialTimeline.details.period")}</dt>
        <dd>
          {formatDateTime(course.start)} → {formatDateTime(course.end)}
          <div>
            {t(`antimicrobialTimeline.status.${course.status}`)} ·{" "}
            {t("antimicrobialTimeline.details.days", { count: course.days })}
          </div>
        </dd>

        {course.plannedEnd && (
          <>
            <dt>{t("antimicrobialTimeline.details.plannedEnd")}</dt>
            <dd>{formatDateTime(course.plannedEnd)}</dd>
          </>
        )}

        <dt>{t("antimicrobialTimeline.details.prescriptionType")}</dt>
        <dd>
          {course.cpoe
            ? t("antimicrobialTimeline.details.cpoe")
            : t("antimicrobialTimeline.details.daily")}{" "}
          ({t("antimicrobialTimeline.details.prescriptions")}:{" "}
          {course.prescriptionCount})
        </dd>

        <dt>{t("antimicrobialTimeline.details.regimens")}</dt>
        <dd>
          <ul>
            {course.regimens.map((regimen, index) => (
              <li key={`${regimen.start}-${index}`}>
                <span className="regimen-date">
                  {formatDateTime(regimen.start)}
                </span>{" "}
                {formatRegimen(regimen) || "-"}
              </li>
            ))}
          </ul>
        </dd>
      </dl>

      {course.gaps.length > 0 && (
        <div className="details-gaps">
          {t("antimicrobialTimeline.details.gaps", {
            count: course.gaps.length,
          })}
        </div>
      )}
    </Details>
  );
}
