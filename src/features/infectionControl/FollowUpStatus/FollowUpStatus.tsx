import { useTranslation } from "react-i18next";
import { Tag } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { InfectionControlStatusEnum } from "models/InfectionControlEnum";
import { formatDate, formatDateTime } from "utils/date";

import { IFollowUp } from "../InfectionControlSlice";
import { describePending } from "../followUp";
import { FollowUpBox } from "./FollowUpStatus.style";

interface FollowUpStatusProps {
  followUp: IFollowUp;
  drugNames: Record<number, string>;
  now: Dayjs;
}

/**
 * Where the admission stands in the infection control follow-up: pending or
 * revised, why it is pending, the last review and the next one scheduled
 */
export function FollowUpStatus({
  followUp,
  drugNames,
  now,
}: FollowUpStatusProps) {
  const { t } = useTranslation();
  const pendings = followUp.pendings ?? [];
  const lastReview = followUp.reviews?.[0];
  const nextReviewOverdue =
    !!followUp.nextReviewDate && dayjs(followUp.nextReviewDate).isBefore(now);

  return (
    <FollowUpBox data-kb="infectionControl.followUp" data-testid="follow-up">
      <div className="follow-up-header">
        <div className="follow-up-title">
          <h2>{t("infectionControl.followUp.title")}</h2>
          {followUp.followed ? (
            <>
              <Tag
                color={InfectionControlStatusEnum.getColor(followUp.status)}
                data-testid="follow-up-status"
              >
                {t(`infectionControl.followUp.status.${followUp.status}`)}
              </Tag>
              {followUp.statusDate && (
                <span className="follow-up-since">
                  {t("infectionControl.followUp.since", {
                    date: formatDateTime(followUp.statusDate),
                  })}
                </span>
              )}
            </>
          ) : (
            <Tag data-testid="follow-up-status">
              {t("infectionControl.followUp.notFollowed")}
            </Tag>
          )}
        </div>
      </div>

      {!followUp.followed && (
        <p className="follow-up-hint">
          {t("infectionControl.followUp.notFollowedHint")}
        </p>
      )}

      {followUp.followed && (
        <>
          <div className="follow-up-data">
            <div className="follow-up-data-item">
              <span className="follow-up-data-label">
                {t("infectionControl.followUp.nextReview")}
              </span>
              <span
                className={`follow-up-data-value ${
                  nextReviewOverdue ? "follow-up-overdue" : ""
                }`}
              >
                {followUp.nextReviewDate
                  ? formatDate(followUp.nextReviewDate)
                  : t("infectionControl.followUp.noNextReview")}
                {nextReviewOverdue &&
                  ` (${t("infectionControl.followUp.overdue")})`}
              </span>
            </div>
            <div className="follow-up-data-item">
              <span className="follow-up-data-label">
                {t("infectionControl.followUp.lastReview")}
              </span>
              <span className="follow-up-data-value">
                {lastReview
                  ? t("infectionControl.followUp.reviewBy", {
                      date: formatDateTime(lastReview.createdAt),
                      user: lastReview.createdBy ?? "-",
                    })
                  : t("infectionControl.followUp.neverReviewed")}
              </span>
            </div>
          </div>

          <div className="follow-up-pendings" data-testid="follow-up-pendings">
            <span className="follow-up-data-label">
              {t("infectionControl.followUp.pendings")}
            </span>
            {pendings.length === 0 ? (
              <div className="muted">
                {t("infectionControl.followUp.noPendings")}
              </div>
            ) : (
              <ul>
                {pendings.map((pending) => (
                  <li key={pending.id}>
                    {describePending(pending, drugNames, t)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </FollowUpBox>
  );
}
