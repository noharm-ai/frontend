import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import dayjs, { Dayjs } from "dayjs";

import PatientNameCache from "components/PatientName/PatientNameCache";
import RichTextView from "components/RichTextView";
import { hasAwareLevel } from "features/culture/awareLevel";
import { InfectionControlPendingTypeEnum } from "models/InfectionControlEnum";
import { formatDate, formatDateTime } from "utils/date";

import {
  ALERT_LEVELS,
  IAntimicrobialEvaluation,
  IAntimicrobialTimeline,
  ICourse,
  IFollowUp,
} from "../InfectionControlSlice";
import {
  courseKey,
  describeEvaluationOutcome,
  describePending,
  describeReasons,
  describeSubstitute,
  getFollowUpCourses,
  getInvalidatedEvaluations,
} from "../followUp";
import { formatDose, formatRegimen, getAge } from "../timeline";
import { ReportDocument } from "./InfectionControlReport.style";

interface InfectionControlReportProps {
  // the document, for react-to-print
  ref?: React.Ref<HTMLDivElement>;
  data: IAntimicrobialTimeline;
  // null when the follow-up failed to load, or the schema does not have it
  followUp: IFollowUp | null;
  // as the timeline sorts them
  courses: ICourse[];
  drugNames: Record<number, string>;
  now: Dayjs;
}

// the label of each trigger an evaluation can send the patient back to
// pending for
const TRIGGER_LABELS: Record<number, string> = {
  [InfectionControlPendingTypeEnum.EXPIRED]:
    "infectionControl.review.triggerExpired",
  [InfectionControlPendingTypeEnum.POSOLOGY_CHANGED]:
    "infectionControl.review.triggerPosology",
};

interface IField {
  label: string;
  value: React.ReactNode;
}

/** Label and value pairs, in a grid; the empty ones show a dash */
const Fields = ({ items }: { items: IField[] }) => (
  <dl className="report-fields">
    {items.map((item) => (
      <div key={item.label}>
        <dt>{item.label}</dt>
        <dd>{item.value ?? "-"}</dd>
      </div>
    ))}
  </dl>
);

/**
 * Everything on record about the antimicrobials of an admission and its
 * infection control reviews, laid out as a document to print: the patient,
 * where the follow-up stands, each course with its posologies, gaps, alerts
 * and evaluations, and each review with every detail of what it evaluated.
 * The same document shows on screen and goes to paper
 */
export function InfectionControlReport({
  ref,
  data,
  followUp,
  courses,
  drugNames,
  now,
}: InfectionControlReportProps) {
  const { t } = useTranslation();
  const { patient } = data;

  const followUpEnabled = !!followUp?.enabled;
  const followUpCourses = useMemo(
    () => getFollowUpCourses(followUp),
    [followUp],
  );
  const invalidated = useMemo(
    () => getInvalidatedEvaluations(followUp),
    [followUp],
  );

  // the course of each evaluation, for when it stopped holding
  const courseByEvaluation = useMemo(() => {
    const byKey: Record<string, ICourse> = {};
    courses.forEach((course) => {
      byKey[courseKey(course.idDrug, course.start)] = course;
    });

    const map: Record<string, ICourse | undefined> = {};
    (followUp?.courses ?? []).forEach((followUpCourse) => {
      followUpCourse.history.forEach((evaluation) => {
        map[evaluation.id] =
          byKey[courseKey(followUpCourse.idDrug, followUpCourse.start)];
      });
    });

    return map;
  }, [courses, followUp]);

  const evaluationsByReview = useMemo(() => {
    const map: Record<string, IAntimicrobialEvaluation[]> = {};
    (followUp?.courses ?? []).forEach((course) => {
      course.history.forEach((evaluation) => {
        (map[evaluation.idReview] ??= []).push(evaluation);
      });
    });

    return map;
  }, [followUp]);

  const verdict = (evaluation: IAntimicrobialEvaluation) =>
    t(
      evaluation.conforming
        ? "infectionControl.evaluation.conforming"
        : "infectionControl.evaluation.nonConforming",
    );

  const outcome = (evaluation: IAntimicrobialEvaluation) =>
    describeEvaluationOutcome(
      evaluation,
      invalidated[evaluation.id],
      courseByEvaluation[evaluation.id],
      now,
      t,
    );

  const period = (evaluation: IAntimicrobialEvaluation) =>
    t("infectionControl.report.period", {
      from: formatDateTime(evaluation.validFrom),
      until: formatDateTime(evaluation.validUntil),
    });

  // the age at the discharge, once the patient left
  const age = getAge(
    patient.birthdate,
    patient.dischargeDate ? dayjs(patient.dischargeDate) : now,
  );

  const patientFields: IField[] = [
    {
      label: t("infectionControl.report.name"),
      value: <PatientNameCache idPatient={patient.idPatient} />,
    },
    {
      label: t("infectionControl.patient.admission"),
      value: patient.admissionNumber,
    },
    { label: t("patientCard.medicalRecord"), value: patient.record },
    {
      label: t("infectionControl.report.birthdate"),
      value: patient.birthdate
        ? [
            formatDate(patient.birthdate),
            age &&
              t(
                age.unit === "years"
                  ? "infectionControl.patient.ageYears"
                  : "infectionControl.patient.ageMonths",
                { count: age.value },
              ),
          ]
            .filter(Boolean)
            .join(" · ")
        : null,
    },
    {
      label: t("infectionControl.patient.gender"),
      value:
        patient.gender === "M"
          ? t("infectionControl.patient.male")
          : patient.gender === "F"
            ? t("infectionControl.patient.female")
            : null,
    },
    {
      label: t("infectionControl.patient.weight"),
      value: patient.weight
        ? `${patient.weight} kg${
            patient.weightDate ? ` (${formatDate(patient.weightDate)})` : ""
          }`
        : null,
    },
    {
      label: t("patientCard.height"),
      value: patient.height ? `${patient.height} cm` : null,
    },
    {
      label: t("infectionControl.patient.department"),
      value: patient.department,
    },
    { label: t("infectionControl.patient.bed"), value: patient.bed },
    { label: t("patientCard.segment"), value: patient.segment },
    {
      label: t("infectionControl.patient.admissionDate"),
      value: formatDateTime(patient.admissionDate),
    },
    {
      label: t("infectionControl.patient.dischargeDate"),
      value: patient.dischargeDate
        ? [formatDateTime(patient.dischargeDate), patient.dischargeReason]
            .filter(Boolean)
            .join(" · ")
        : null,
    },
  ];

  const renderFollowUp = (followUp: IFollowUp) => {
    const reviews = followUp.reviews ?? [];
    const pendings = followUp.pendings ?? [];

    if (!followUp.followed) {
      return (
        <p className="report-muted">
          {t("infectionControl.followUp.notFollowedHint")}
        </p>
      );
    }

    return (
      <>
        <Fields
          items={[
            {
              label: t("infectionControl.report.status"),
              value: [
                t(`infectionControl.followUp.status.${followUp.status}`),
                followUp.statusDate &&
                  t("infectionControl.followUp.sinceAt", {
                    date: formatDate(followUp.statusDate),
                    time: formatDate(followUp.statusDate, "HH:mm"),
                  }),
              ]
                .filter(Boolean)
                .join(" "),
            },
            {
              label: t("infectionControl.followUp.lastReview"),
              value: reviews[0]
                ? formatDateTime(reviews[0].createdAt)
                : t("infectionControl.followUp.neverReviewed"),
            },
            {
              label: t("infectionControl.followUp.nextReview"),
              value: followUp.nextReviewDate
                ? formatDate(followUp.nextReviewDate)
                : t("infectionControl.followUp.noNextReview"),
            },
          ]}
        />
        <h3>{t("infectionControl.followUp.pendings")}</h3>
        {pendings.length === 0 ? (
          <p className="report-muted">
            {t("infectionControl.followUp.noPendings")}
          </p>
        ) : (
          <ul className="report-list" data-testid="report-pendings">
            {pendings.map((pending) => (
              <li key={pending.id}>
                {describePending(pending, drugNames, t)}{" "}
                <span className="report-muted">
                  ({formatDateTime(pending.createdAt)})
                </span>
              </li>
            ))}
          </ul>
        )}
      </>
    );
  };

  const renderCourse = (course: ICourse) => {
    const followUpCourse =
      followUpCourses[courseKey(course.idDrug, course.start)];
    const evaluations = followUpCourse?.history ?? [];
    const alerts = [...(course.alerts ?? [])].sort(
      (a, b) => ALERT_LEVELS.indexOf(a.level) - ALERT_LEVELS.indexOf(b.level),
    );
    const hasDoseWeight = course.regimens.some(
      (regimen) => regimen.doseWeight || regimen.doseWeightDay,
    );

    return (
      <article
        className="report-block"
        key={courseKey(course.idDrug, course.start)}
        data-testid="report-course"
      >
        <h3>
          {course.drug}{" "}
          <span className="report-muted">
            · {t(`infectionControl.status.${course.status}`)}
          </span>
        </h3>

        <Fields
          items={[
            {
              label: t("infectionControl.report.substance"),
              value: course.substance,
            },
            {
              label: t("culture.awareLevel.label"),
              value: hasAwareLevel(course.atbLevel)
                ? t(`culture.awareLevel.${course.atbLevel}`)
                : null,
            },
            {
              label: t("infectionControl.details.start"),
              value: formatDateTime(course.start),
            },
            {
              label: now.isBefore(course.end)
                ? t("infectionControl.details.prescribedUntil")
                : t("infectionControl.details.end"),
              value: formatDateTime(course.end),
            },
            {
              label: t("infectionControl.details.plannedEnd"),
              value: formatDateTime(course.plannedEnd),
            },
            {
              label: t("infectionControl.details.treatment"),
              value:
                course.plannedDays != null
                  ? t("infectionControl.details.daysPlanned", {
                      count: course.days,
                      planned: course.plannedDays,
                    })
                  : t("infectionControl.details.days", { count: course.days }),
            },
            {
              label: t("infectionControl.details.prescriptionType"),
              value: course.cpoe
                ? t("infectionControl.details.cpoe")
                : t("infectionControl.details.daily"),
            },
            {
              label: t("infectionControl.details.prescriptions"),
              value: course.prescriptionCount,
            },
            ...(followUpEnabled && followUpCourse
              ? [
                  {
                    label: t("infectionControl.report.currentEvaluation"),
                    value: followUpCourse.evaluation
                      ? `${verdict(followUpCourse.evaluation)} · ${outcome(
                          followUpCourse.evaluation,
                        )}`
                      : t("infectionControl.evaluation.none"),
                  },
                ]
              : []),
          ]}
        />

        <h4>
          {t("infectionControl.details.regimens")} ({course.regimens.length})
        </h4>
        {course.regimens.length === 0 ? (
          <p className="report-muted">-</p>
        ) : (
          <table className="report-table">
            <thead>
              <tr>
                <th>{t("infectionControl.details.start")}</th>
                <th>{t("infectionControl.details.end")}</th>
                <th>{t("infectionControl.details.dose")}</th>
                {hasDoseWeight && (
                  <th>{t("infectionControl.review.doseWeightShow")}</th>
                )}
                <th>{t("infectionControl.details.frequency")}</th>
                <th>{t("infectionControl.details.route")}</th>
              </tr>
            </thead>
            <tbody>
              {course.regimens.map((regimen, index) => (
                <RegimenRows
                  key={`${regimen.start}-${index}`}
                  cells={[
                    formatDateTime(regimen.start),
                    formatDateTime(regimen.end),
                    formatDose(regimen) ?? "-",
                    ...(hasDoseWeight
                      ? [
                          [regimen.doseWeight, regimen.doseWeightDay]
                            .filter(Boolean)
                            .join(" · ") || "-",
                        ]
                      : []),
                    regimen.frequency || "-",
                    regimen.route || "-",
                  ]}
                  notes={regimen.notes}
                  notesLabel={t("infectionControl.details.notes")}
                />
              ))}
            </tbody>
          </table>
        )}

        {course.gaps.length > 0 && (
          <>
            <h4>
              {t("infectionControl.details.gapsTitle")} ({course.gaps.length})
            </h4>
            <ul className="report-list">
              {course.gaps.map((gap) => (
                <li key={gap.start}>
                  {t("infectionControl.report.period", {
                    from: formatDateTime(gap.start),
                    until: formatDateTime(gap.end),
                  })}
                </li>
              ))}
            </ul>
          </>
        )}

        {alerts.length > 0 && (
          <>
            <h4>
              {t("infectionControl.alerts.title")} ({alerts.length})
            </h4>
            <ul className="report-list">
              {alerts.map((alert, index) => (
                <li key={`${alert.key}-${index}`} className="report-alert">
                  <strong>
                    {t(`infectionControl.alerts.level.${alert.level}`)}:
                  </strong>
                  <RichTextView text={alert.text} maxWidth="100%" />
                </li>
              ))}
            </ul>
          </>
        )}

        {followUpEnabled && (
          <>
            <h4>
              {t("infectionControl.report.evaluations", {
                count: evaluations.length,
              })}
            </h4>
            {evaluations.length === 0 ? (
              <p className="report-muted">
                {t("infectionControl.report.noEvaluations")}
              </p>
            ) : (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>{t("infectionControl.report.reviewedAt")}</th>
                    <th>{t("infectionControl.report.verdict")}</th>
                    <th>{t("infectionControl.report.validity")}</th>
                    <th>{t("infectionControl.report.outcome")}</th>
                    <th>{t("infectionControl.report.reviewer")}</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluations.map((evaluation) => (
                    <tr key={evaluation.id}>
                      <td>{formatDateTime(evaluation.createdAt)}</td>
                      <td>
                        <Verdict evaluation={evaluation}>
                          {verdict(evaluation)}
                        </Verdict>
                      </td>
                      <td>{period(evaluation)}</td>
                      <td>{outcome(evaluation)}</td>
                      <td>{evaluation.createdBy ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </article>
    );
  };

  const renderEvaluation = (evaluation: IAntimicrobialEvaluation) => {
    const reasons = describeReasons(evaluation);
    const substitute = describeSubstitute(evaluation);
    const interventions = evaluation.interventions ?? [];
    const posology = formatRegimen(evaluation.posology);

    return (
      <div
        className="report-evaluation"
        key={evaluation.id}
        data-testid="report-evaluation"
      >
        <div className="report-evaluation-title">
          <strong>{drugNames[evaluation.idDrug] ?? evaluation.idDrug}</strong> ·{" "}
          <Verdict evaluation={evaluation}>{verdict(evaluation)}</Verdict>
        </div>
        <Fields
          items={[
            {
              label: t("infectionControl.report.validity"),
              value: period(evaluation),
            },
            {
              label: t("infectionControl.report.outcome"),
              value: outcome(evaluation),
            },
            {
              label: t("infectionControl.report.posology"),
              value: posology || null,
            },
            {
              label: t("infectionControl.review.triggersTitle"),
              value: evaluation.triggers?.length
                ? evaluation.triggers
                    .map((trigger) =>
                      TRIGGER_LABELS[trigger]
                        ? t(TRIGGER_LABELS[trigger])
                        : `${trigger}`,
                    )
                    .join("; ")
                : t("infectionControl.review.triggersNone"),
            },
            ...(!evaluation.conforming || reasons
              ? [
                  {
                    label: t("infectionControl.review.reasons"),
                    value: reasons || null,
                  },
                ]
              : []),
            ...(substitute
              ? [
                  {
                    label: t("infectionControl.review.substitute"),
                    value: substitute,
                  },
                ]
              : []),
            ...(interventions.length
              ? [
                  {
                    label: t("infectionControl.report.interventions"),
                    value: interventions
                      .map((intervention) =>
                        t(`interventionStatus.${intervention.status}`),
                      )
                      .join(", "),
                  },
                ]
              : []),
          ]}
        />
        {evaluation.notes && (
          <div className="report-notes">
            <span className="report-label">
              {evaluation.conforming
                ? t("infectionControl.review.evaluationNotes")
                : t("infectionControl.review.justification")}
            </span>
            {evaluation.notes}
          </div>
        )}
      </div>
    );
  };

  const reviews = followUp?.reviews ?? [];

  return (
    <ReportDocument ref={ref} data-testid="infection-control-report">
      {/* on screen the page header carries the title */}
      <header className="report-header report-print-only">
        <h1>{t("infectionControl.report.title")}</h1>
        <div className="report-muted">
          {t("infectionControl.report.generatedAt", {
            admissionNumber: patient.admissionNumber,
            date: formatDateTime(now.toISOString()),
          })}
        </div>
      </header>

      <section>
        <h2>{t("infectionControl.patient.title")}</h2>
        <Fields items={patientFields} />
      </section>

      {followUpEnabled && followUp && (
        <section>
          <h2>{t("infectionControl.followUp.title")}</h2>
          {renderFollowUp(followUp)}
        </section>
      )}

      <section>
        <h2>
          {t("infectionControl.report.antimicrobials", {
            count: courses.length,
          })}
        </h2>
        {courses.length === 0 ? (
          <p className="report-muted">{t("infectionControl.timeline.empty")}</p>
        ) : (
          courses.map(renderCourse)
        )}
      </section>

      {followUpEnabled && (
        <section>
          <h2>
            {t("infectionControl.report.reviews", {
              count: reviews.length,
            })}
          </h2>
          {reviews.length === 0 && (
            <p className="report-muted">
              {t("infectionControl.history.empty")}
            </p>
          )}
          {reviews.map((review) => {
            const evaluations = evaluationsByReview[review.id] ?? [];

            return (
              <article
                className="report-block"
                key={review.id}
                data-testid="report-review"
              >
                <h3>
                  {t("infectionControl.report.reviewTitle", {
                    date: formatDateTime(review.createdAt),
                  })}
                  {review.createdBy && (
                    <span className="report-muted">
                      {" "}
                      ·{" "}
                      {t("infectionControl.followUp.reviewedBy", {
                        user: review.createdBy,
                      })}
                    </span>
                  )}
                </h3>
                <Fields
                  items={[
                    {
                      label: t("infectionControl.report.nextReview"),
                      value: review.nextReviewDate
                        ? formatDate(review.nextReviewDate)
                        : t("infectionControl.followUp.noNextReview"),
                    },
                    {
                      label: t("infectionControl.report.evaluatedDrugs"),
                      value: evaluations.length,
                    },
                  ]}
                />
                {review.notes && (
                  <div className="report-notes">
                    <span className="report-label">
                      {t("infectionControl.review.notes")}
                    </span>
                    {review.notes}
                  </div>
                )}
                {evaluations.length === 0 ? (
                  <p className="report-muted">
                    {t("infectionControl.report.noReviewEvaluations")}
                  </p>
                ) : (
                  evaluations.map(renderEvaluation)
                )}
              </article>
            );
          })}
        </section>
      )}
    </ReportDocument>
  );
}

/** The verdict, green when conforming and red when not */
const Verdict = ({
  evaluation,
  children,
}: {
  evaluation: IAntimicrobialEvaluation;
  children: React.ReactNode;
}) => (
  <span
    className={
      evaluation.conforming ? "report-conforming" : "report-non-conforming"
    }
  >
    {children}
  </span>
);

/** A posology row, followed by its notes when it has them */
const RegimenRows = ({
  cells,
  notes,
  notesLabel,
}: {
  cells: React.ReactNode[];
  notes?: string | null;
  notesLabel: string;
}) => (
  <>
    <tr className={notes ? "report-row-with-notes" : ""}>
      {cells.map((cell, index) => (
        <td key={index}>{cell}</td>
      ))}
    </tr>
    {notes && (
      <tr className="report-row-notes">
        <td colSpan={cells.length}>
          <span className="report-label">{notesLabel}:</span>
          <RichTextView text={notes} maxWidth="100%" />
        </td>
      </tr>
    )}
  </>
);
