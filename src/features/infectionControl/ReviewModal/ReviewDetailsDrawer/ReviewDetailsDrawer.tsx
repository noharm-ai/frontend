import { useTranslation } from "react-i18next";
import { Button, Drawer, Tabs } from "antd";
import dayjs, { Dayjs } from "dayjs";

import RichTextView from "components/RichTextView";
import { formatDateTime } from "utils/date";

import {
  IAntimicrobialEvaluation,
  ICourse,
  IDrugAlert,
  IFollowUpPending,
  ALERT_LEVELS,
} from "../../InfectionControlSlice";
import { InvalidationReason } from "../../InvalidationReason/InvalidationReason";
import { useAlertHandling } from "../../ScreeningAlerts/useAlertHandling";
import { describeReasons, describeSubstitute } from "../../followUp";
import { formatDose } from "../../timeline";
import { verdictLabel } from "../reviewForm";
import { DetailsBody, DetailsTitle } from "./ReviewDetailsDrawer.style";

export type ReviewDetailsTab = "prescription" | "pendings" | "alerts";

interface ReviewDetailsDrawerProps {
  // the tab shown, null when the drawer is closed
  tab: ReviewDetailsTab | null;
  onTabChange: (tab: ReviewDetailsTab) => void;
  onClose: () => void;
  drug: string;
  // the day of treatment and the posology, under the drug
  subtitle: string;
  // the course being evaluated, with its alerts and posology
  course?: ICourse;
  // the evaluation on record, and the reasons it no longer holds
  evaluation: IAntimicrobialEvaluation | null;
  invalidations: IFollowUpPending[];
  // server time the course was judged at
  now: Dayjs;
}

/**
 * What is known of the drug beside the review form: its current prescription,
 * why its evaluation on record no longer holds and the screening alerts of its
 * course, one tab each
 */
export function ReviewDetailsDrawer({
  tab,
  onTabChange,
  onClose,
  drug,
  subtitle,
  course,
  evaluation,
  invalidations,
  now,
}: ReviewDetailsDrawerProps) {
  const { t } = useTranslation();
  const { loadingType, showHandling } = useAlertHandling(course?.idSubstance);

  const alerts = ALERT_LEVELS.flatMap((level) =>
    (course?.alerts ?? []).filter((alert) => alert.level === level),
  );

  const tabLabel = (label: string, count: number, kind: ReviewDetailsTab) => (
    <span className="details-tab">
      {label}
      <span className={`details-count ${kind}`}>{count}</span>
    </span>
  );

  const items = [];

  if (course) {
    const regimen = course.regimens.at(-1);
    // only what the prescription has: no weight, no dose by weight
    const posology = [
      {
        label: t("infectionControl.details.dose"),
        value: regimen && formatDose(regimen),
      },
      {
        label: t("infectionControl.details.frequency"),
        value: regimen?.frequency,
      },
      { label: t("infectionControl.details.route"), value: regimen?.route },
      {
        label: t("infectionControl.review.doseWeight"),
        value: regimen?.doseWeight,
      },
      {
        label: t("infectionControl.review.doseWeightDay"),
        value: regimen?.doseWeightDay,
      },
      {
        label: t("infectionControl.review.since"),
        value: regimen && formatDateTime(regimen.start),
      },
    ].filter((item) => item.value);
    const treatment = [
      {
        label: t("infectionControl.review.substance"),
        value: course.substance,
      },
      {
        label: t("infectionControl.details.start"),
        value: formatDateTime(course.start),
      },
      {
        label: dayjs(course.end).isAfter(now)
          ? t("infectionControl.details.prescribedUntil")
          : t("infectionControl.details.end"),
        value: formatDateTime(course.end),
      },
      {
        label: t("infectionControl.details.plannedEnd"),
        value: course.plannedEnd && formatDateTime(course.plannedEnd),
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
    ].filter((item) => item.value != null && item.value !== "");

    const facts = (list: { label: string; value: unknown }[]) => (
      <dl className="details-facts">
        {list.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{String(item.value)}</dd>
          </div>
        ))}
      </dl>
    );

    items.push({
      key: "prescription",
      label: (
        <span className="details-tab">
          {t("infectionControl.review.prescription")}
        </span>
      ),
      children: (
        <div
          className="details-list"
          data-kb="infectionControl.review.prescription"
          data-testid="review-prescription"
        >
          <div className="details-card">
            <span className="details-section-title">
              {t("infectionControl.review.currentPosology")}
            </span>
            {posology.length > 0 && facts(posology)}
            {regimen?.notes && (
              <div
                className="details-complement"
                data-testid="review-prescription-complement"
              >
                <span className="details-card-label">
                  {t("infectionControl.review.complement")}
                </span>
                <RichTextView text={regimen.notes} maxWidth="100%" />
              </div>
            )}
          </div>
          <div className="details-card">
            <span className="details-section-title">
              {t("infectionControl.review.course")}
            </span>
            {facts(treatment)}
          </div>
          <Button
            className="details-open"
            href={`/prescricao/${course.lastIdPrescription}`}
            target="_blank"
          >
            {t("infectionControl.details.openPrescription")}
          </Button>
        </div>
      ),
    });
  }

  if (evaluation && invalidations.length) {
    items.push({
      key: "pendings",
      label: tabLabel(
        t("infectionControl.review.pendings"),
        invalidations.length,
        "pendings",
      ),
      children: (
        <div
          className="details-list"
          data-kb="infectionControl.review.pendings"
          data-testid="review-pendings"
        >
          <div className="details-card" data-testid="review-current-evaluation">
            <span className="details-card-label">
              {t("infectionControl.review.currentEvaluation")}
            </span>
            <div>
              <strong>
                <s>{verdictLabel(evaluation.conforming, t)}</s>
              </strong>{" "}
              {t("infectionControl.review.evaluatedBy", {
                date: formatDateTime(evaluation.createdAt),
                user: evaluation.createdBy ?? "-",
              })}
            </div>
            {describeReasons(evaluation) && (
              <div>
                {t("infectionControl.evaluation.reasons", {
                  reasons: describeReasons(evaluation),
                })}
              </div>
            )}
            {describeSubstitute(evaluation) && (
              <div>
                {t("infectionControl.evaluation.substitute", {
                  drug: describeSubstitute(evaluation),
                })}
              </div>
            )}
            {evaluation.notes && (
              <em className="details-notes">{evaluation.notes}</em>
            )}
          </div>
          <div className="details-section-title">
            {t("infectionControl.review.invalidated")}
          </div>
          <ul className="details-reasons">
            {invalidations.map((pending) => (
              <InvalidationReason
                key={pending.id}
                pending={pending}
                evaluation={evaluation}
                course={course}
              />
            ))}
          </ul>
        </div>
      ),
    });
  }

  if (alerts.length) {
    items.push({
      key: "alerts",
      label: tabLabel(
        t("infectionControl.alerts.title"),
        alerts.length,
        "alerts",
      ),
      children: (
        <div
          className="details-list"
          data-kb="infectionControl.review.alerts"
          data-testid="review-alerts"
        >
          {alerts.map((alert: IDrugAlert, index) => (
            <div
              key={`${alert.type}-${index}`}
              className="details-card"
              data-testid="review-alert"
            >
              <div className="details-card-meta">
                <span className={`details-level ${alert.level}`}>
                  {t(`infectionControl.alerts.level.${alert.level}`)}
                </span>
                <span className="details-card-label">
                  {t(`drugAlertType.${alert.type}`, { defaultValue: "" })}
                </span>
              </div>
              <RichTextView text={alert.text} maxWidth="100%" />
              {alert.handling && (
                <button
                  type="button"
                  className="details-handling"
                  disabled={loadingType !== null}
                  onClick={() => showHandling(alert.type)}
                >
                  {t("infectionControl.alerts.handling")}
                </button>
              )}
            </div>
          ))}
        </div>
      ),
    });
  }

  return (
    <Drawer
      open={tab !== null}
      onClose={onClose}
      size={440}
      destroyOnHidden
      mask={{ blur: false }}
      closable={{ placement: "end" }}
      title={
        <DetailsTitle>
          <div className="details-title">{drug}</div>
          {subtitle && <div className="details-subtitle">{subtitle}</div>}
        </DetailsTitle>
      }
      styles={{
        header: { borderBottom: 0, paddingBottom: 0 },
        body: { padding: 0 },
      }}
    >
      <DetailsBody>
        <Tabs
          activeKey={tab ?? undefined}
          onChange={(key) => onTabChange(key as ReviewDetailsTab)}
          items={items}
        />
      </DetailsBody>
    </Drawer>
  );
}
