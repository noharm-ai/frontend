import { useTranslation } from "react-i18next";
import { Drawer, Tabs } from "antd";

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
import { verdictLabel } from "../reviewForm";
import { DetailsBody, DetailsTitle } from "./ReviewDetailsDrawer.style";

export type ReviewDetailsTab = "pendings" | "alerts";

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
}

/**
 * What is known of the drug beside the review form: why its evaluation on
 * record no longer holds and the screening alerts of its course, one tab each
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
