import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Tooltip } from "antd";
import { PrinterOutlined, WarningOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";

import DefaultModal from "components/Modal";
import { InfectionControlStatusEnum } from "models/InfectionControlEnum";
import { formatDate } from "utils/date";

import { IFollowUp } from "../InfectionControlSlice";
import { describePending, reportUrl } from "../followUp";
import { ReviewHistory } from "../ReviewHistory/ReviewHistory";
import { FollowUpBox, HistoryBody, PendingsBody } from "./FollowUpStatus.style";

interface FollowUpStatusProps {
  followUp: IFollowUp;
  drugNames: Record<number, string>;
  now: Dayjs;
}

const STATUS_CLASS: Record<number, string> = {
  [InfectionControlStatusEnum.PENDING]: "pending",
  [InfectionControlStatusEnum.REVISED]: "revised",
  [InfectionControlStatusEnum.CLOSED]: "closed",
};

/**
 * Where the admission stands in the infection control follow-up: pending or
 * revised, the last review, the next one scheduled and how many reasons keep
 * it pending. Every review and every pending reason is one click away, in a
 * modal
 */
export function FollowUpStatus({
  followUp,
  drugNames,
  now,
}: FollowUpStatusProps) {
  const { t } = useTranslation();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pendingsOpen, setPendingsOpen] = useState(false);
  const pendings = followUp.pendings ?? [];
  const reviews = followUp.reviews ?? [];
  const lastReview = reviews[0];
  const nextReviewOverdue =
    !!followUp.nextReviewDate && dayjs(followUp.nextReviewDate).isBefore(now);

  const status = followUp.followed ? followUp.status : null;
  const statusClass = (status != null && STATUS_CLASS[status]) || "none";

  return (
    <FollowUpBox
      className={statusClass}
      data-kb="infectionControl.followUp"
      data-testid="follow-up"
    >
      <div className="follow-up-header">
        <span className="follow-up-dot" />
        <span className="follow-up-status" data-testid="follow-up-status">
          {followUp.followed
            ? t(`infectionControl.followUp.status.${followUp.status}`)
            : t("infectionControl.followUp.notFollowed")}
        </span>
        {followUp.followed && followUp.statusDate && (
          <span className="follow-up-since">
            {t("infectionControl.followUp.sinceAt", {
              date: formatDate(followUp.statusDate),
              time: formatDate(followUp.statusDate, "HH:mm"),
            })}
          </span>
        )}
      </div>

      {followUp.followed ? (
        <div className="follow-up-columns">
          <div className="follow-up-column">
            <div className="follow-up-label">
              {t("infectionControl.followUp.lastReview")}
            </div>
            {lastReview ? (
              // the date opens every review of the admission, with its time
              <div className="follow-up-value">
                <Tooltip
                  title={t("infectionControl.followUp.showHistory", {
                    count: reviews.length,
                  })}
                >
                  <Button
                    type="link"
                    className="follow-up-link"
                    data-testid="follow-up-last-review"
                    onClick={() => setHistoryOpen(true)}
                  >
                    {formatDate(lastReview.createdAt)}
                  </Button>
                </Tooltip>
                {lastReview.createdBy && (
                  // clipped when the panel is narrow, whole on hover
                  <span
                    className="follow-up-detail"
                    title={lastReview.createdBy}
                  >
                    {t("infectionControl.followUp.reviewedBy", {
                      user: lastReview.createdBy,
                    })}
                  </span>
                )}
              </div>
            ) : (
              <div className="follow-up-value">
                {t("infectionControl.followUp.neverReviewed")}
              </div>
            )}
          </div>

          <div className="follow-up-column">
            <div className="follow-up-label">
              {t("infectionControl.followUp.nextReview")}
            </div>
            <div
              className={`follow-up-value ${
                nextReviewOverdue ? "follow-up-overdue" : ""
              }`}
            >
              {followUp.nextReviewDate
                ? formatDate(followUp.nextReviewDate)
                : t("infectionControl.followUp.noNextReview")}
              {nextReviewOverdue && (
                <span className="follow-up-detail">
                  {t("infectionControl.followUp.overdue")}
                </span>
              )}
            </div>
          </div>

          <div className="follow-up-column" data-testid="follow-up-pendings">
            <div className="follow-up-label">
              {t("infectionControl.followUp.pendings")}
            </div>
            {pendings.length === 0 ? (
              <div className="follow-up-value">
                {t("infectionControl.followUp.noPendings")}
              </div>
            ) : (
              // the card only counts them; the reasons are listed in a modal
              <div className="follow-up-value">
                <Button
                  type="link"
                  className="follow-up-link"
                  data-testid="follow-up-pendings-count"
                  onClick={() => setPendingsOpen(true)}
                >
                  {t("infectionControl.followUp.pendingsCount", {
                    count: pendings.length,
                  })}
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="follow-up-hint">
          {t("infectionControl.followUp.notFollowedHint")}
        </div>
      )}

      <DefaultModal
        open={historyOpen}
        width={720}
        centered
        destroyOnHidden
        onCancel={() => setHistoryOpen(false)}
        footer={null}
      >
        <HistoryBody data-kb="infectionControl.reviews">
          <div className="history-header">
            <h2 className="modal-title">
              {t("infectionControl.history.title")}
            </h2>
            {/* the report page, with every detail of the reviews, to print */}
            <Button
              icon={<PrinterOutlined />}
              data-testid="history-open-report"
              href={reportUrl(followUp.admissionNumber)}
              target="_blank"
            >
              {t("infectionControl.report.openDetailed")}
            </Button>
          </div>
          <ReviewHistory followUp={followUp} drugNames={drugNames} />
        </HistoryBody>
      </DefaultModal>

      <DefaultModal
        open={pendingsOpen}
        width={560}
        centered
        destroyOnHidden
        onCancel={() => setPendingsOpen(false)}
        footer={null}
      >
        <PendingsBody
          data-kb="infectionControl.pendings"
          data-testid="follow-up-pendings-list"
        >
          <h2 className="modal-title">
            {t("infectionControl.followUp.pendings")}
          </h2>
          <ul>
            {pendings.map((pending) => (
              <li key={pending.id}>
                <WarningOutlined className="pending-icon" />
                <div>
                  <div>{describePending(pending, drugNames, t)}</div>
                  <div className="pending-date">
                    {formatDate(pending.createdAt, "DD/MM/YYYY · HH:mm")}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </PendingsBody>
      </DefaultModal>
    </FollowUpBox>
  );
}
