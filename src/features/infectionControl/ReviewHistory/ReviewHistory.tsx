import { useTranslation } from "react-i18next";
import { Tag } from "antd";

import { formatDate, formatDateTime } from "utils/date";

import { IAntimicrobialEvaluation, IFollowUp } from "../InfectionControlSlice";
import { ReviewList } from "./ReviewHistory.style";

interface ReviewHistoryProps {
  followUp: IFollowUp;
  drugNames: Record<number, string>;
}

/** Every review of the patient, latest first, with the drugs it evaluated */
export function ReviewHistory({ followUp, drugNames }: ReviewHistoryProps) {
  const { t } = useTranslation();
  const reviews = followUp.reviews ?? [];

  if (reviews.length === 0) {
    return (
      <ReviewList>
        <div className="muted">{t("infectionControl.history.empty")}</div>
      </ReviewList>
    );
  }

  const evaluationsByReview: Record<string, IAntimicrobialEvaluation[]> = {};
  (followUp.courses ?? []).forEach((course) => {
    course.history.forEach((evaluation) => {
      (evaluationsByReview[evaluation.idReview] ??= []).push(evaluation);
    });
  });

  return (
    <ReviewList>
      {reviews.map((review) => {
        const evaluations = evaluationsByReview[review.id] ?? [];

        return (
          <li key={review.id} data-testid="review-item">
            <div className="review-header">
              <span className="review-date">
                {formatDateTime(review.createdAt)}
              </span>
              {review.createdBy && (
                <span className="review-author">{review.createdBy}</span>
              )}
              {review.nextReviewDate && (
                <span className="muted">
                  {t("infectionControl.history.nextReview", {
                    date: formatDate(review.nextReviewDate),
                  })}
                </span>
              )}
            </div>

            {review.notes && <p className="review-notes">{review.notes}</p>}

            {evaluations.length > 0 && (
              <ul className="review-evaluations">
                {evaluations.map((evaluation) => (
                  <li key={evaluation.id}>
                    <Tag color={evaluation.conforming ? "green" : "red"}>
                      {t(
                        evaluation.conforming
                          ? "infectionControl.evaluation.conforming"
                          : "infectionControl.evaluation.nonConforming",
                      )}
                    </Tag>
                    <span className="review-drug">
                      {drugNames[evaluation.idDrug] ?? evaluation.idDrug}
                    </span>{" "}
                    <span className="muted">
                      {t("infectionControl.evaluation.until", {
                        date: formatDate(evaluation.validUntil),
                      })}
                    </span>
                    {evaluation.notes && (
                      <div className="review-evaluation-notes">
                        {evaluation.notes}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ReviewList>
  );
}
