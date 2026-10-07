import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "antd";
import {
  CalendarOutlined,
  CheckOutlined,
  ExclamationOutlined,
  MinusOutlined,
  StopOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";

import DefaultModal from "components/Modal";
import { InfectionControlStatusEnum } from "models/InfectionControlEnum";
import { formatDate } from "utils/date";

import { IFollowUp } from "../InfectionControlSlice";
import { describePending } from "../followUp";
import { ReviewHistory } from "../ReviewHistory/ReviewHistory";
import { FollowUpBox, HistoryBody, PendingsBody } from "./FollowUpStatus.style";

interface FollowUpStatusProps {
  followUp: IFollowUp;
  drugNames: Record<number, string>;
  now: Dayjs;
  // opens the review, where the next review date is set; absent when the
  // user cannot review
  onSchedule?: () => void;
}

const STATUS_ICON: Record<number, React.ReactNode> = {
  [InfectionControlStatusEnum.PENDING]: <ExclamationOutlined />,
  [InfectionControlStatusEnum.REVISED]: <CheckOutlined />,
  [InfectionControlStatusEnum.CLOSED]: <StopOutlined />,
};

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
  onSchedule,
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
    <FollowUpBox data-kb="infectionControl.followUp" data-testid="follow-up">
      <div className={`follow-up-header ${statusClass}`}>
        <div className="follow-up-icon">
          {(status != null && STATUS_ICON[status]) || <MinusOutlined />}
        </div>
        <div>
          <div className="follow-up-status" data-testid="follow-up-status">
            {followUp.followed
              ? t(`infectionControl.followUp.status.${followUp.status}`)
              : t("infectionControl.followUp.notFollowed")}
          </div>
          <div className="follow-up-since">
            {followUp.followed
              ? followUp.statusDate &&
                t("infectionControl.followUp.sinceAt", {
                  date: formatDate(followUp.statusDate),
                  time: formatDate(followUp.statusDate, "HH:mm"),
                })
              : t("infectionControl.followUp.notFollowedHint")}
          </div>
        </div>
      </div>

      {followUp.followed && (
        <div className="follow-up-rows">
          <div className="follow-up-row">
            <UserOutlined className="follow-up-row-icon" />
            <div className="follow-up-row-content">
              <div className="follow-up-label">
                {t("infectionControl.followUp.lastReview")}
              </div>
              {lastReview ? (
                <>
                  <div className="follow-up-value">
                    {formatDate(lastReview.createdAt, "DD/MM/YYYY · HH:mm")}
                  </div>
                  {lastReview.createdBy && (
                    <div className="follow-up-detail">
                      {t("infectionControl.followUp.reviewedBy", {
                        user: lastReview.createdBy,
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="follow-up-value">
                  {t("infectionControl.followUp.neverReviewed")}
                </div>
              )}
            </div>
            {reviews.length > 0 && (
              <Button
                type="link"
                className="follow-up-action"
                onClick={() => setHistoryOpen(true)}
              >
                {t("infectionControl.followUp.showHistory", {
                  count: reviews.length,
                })}
              </Button>
            )}
          </div>

          <div className="follow-up-row">
            <CalendarOutlined className="follow-up-row-icon" />
            <div className="follow-up-row-content">
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
                {nextReviewOverdue &&
                  ` (${t("infectionControl.followUp.overdue")})`}
              </div>
            </div>
            {onSchedule && (
              <Button
                type="link"
                className="follow-up-action"
                onClick={onSchedule}
              >
                {t(
                  followUp.nextReviewDate
                    ? "infectionControl.followUp.reschedule"
                    : "infectionControl.followUp.schedule",
                )}
              </Button>
            )}
          </div>

          <div className="follow-up-row" data-testid="follow-up-pendings">
            <WarningOutlined className="follow-up-row-icon" />
            <div className="follow-up-row-content">
              <div className="follow-up-label">
                {t("infectionControl.followUp.pendings")}
              </div>
              {pendings.length === 0 ? (
                <div className="follow-up-detail">
                  {t("infectionControl.followUp.noPendings")}
                </div>
              ) : (
                <div
                  className="follow-up-value"
                  data-testid="follow-up-pendings-count"
                >
                  {t("infectionControl.followUp.pendingsCount", {
                    count: pendings.length,
                  })}
                </div>
              )}
            </div>
            {pendings.length > 0 && (
              <Button
                type="link"
                className="follow-up-action"
                onClick={() => setPendingsOpen(true)}
              >
                {t("infectionControl.followUp.showPendings")}
              </Button>
            )}
          </div>
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
          <h2 className="modal-title">{t("infectionControl.history.title")}</h2>
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
