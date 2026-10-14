import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";
import { Tag } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { DatePicker, Textarea } from "components/Inputs";
import { formatDate } from "utils/date";

import { IFollowUpPending } from "../../InfectionControlSlice";
import { ChoiceChips } from "../ChoiceChips/ChoiceChips";
import {
  describeDrugEvaluation,
  getNextReviewDate,
  getTreatmentsEnd,
  IReviewFields,
  NEXT_REVIEW_DAYS,
  NextReview,
} from "../reviewForm";
import { ReviewSummary } from "../ReviewModal.style";

interface ReviewSummaryStepProps {
  // open reasons that make an evaluation on record no longer hold, by id
  invalidatedEvaluations: Record<string, IFollowUpPending[]>;
  // what is chosen for each drug, as its step in the rail tells it
  drugStatus: { label: string; color: string }[];
  // goes back to the step of a drug
  onSelectStep: (index: number) => void;
}

const notAfterToday = (current: Dayjs) =>
  !!current && !current.isAfter(dayjs(), "day");

/**
 * The last step of the review: when the patient is reviewed again, the notes
 * about the patient and what the review records for each drug
 */
export function ReviewSummaryStep({
  invalidatedEvaluations,
  drugStatus,
  onSelectStep,
}: ReviewSummaryStepProps) {
  const { t } = useTranslation();
  const { values, errors, setFieldValue, setFieldError } =
    useFormikContext<IReviewFields>();
  const drugCount = values.evaluations.length;
  const treatmentsEnd = getTreatmentsEnd(values);

  const nextReviewOptions: NextReview[] = [
    "none",
    ...NEXT_REVIEW_DAYS.map((days) => `days${days}` as NextReview),
    ...(treatmentsEnd ? ["treatmentEnd" as NextReview] : []),
    "date",
  ];

  return (
    <ReviewSummary>
      <div className="step-header">
        <h3 className="step-title">
          {t("infectionControl.review.patientStepTitle")}
        </h3>
        <p className="step-legend">
          {t("infectionControl.review.patientStepLegend")}
        </p>
      </div>

      <section
        className={`summary-section ${errors.nextReviewDate ? "error" : ""}`}
        data-kb="infectionControl.review.schedule"
      >
        <h4 className="summary-section-title">
          {t("infectionControl.review.nextReviewDate")}
        </h4>
        <div className="summary-choice">
          <ChoiceChips<NextReview>
            aria-label={t("infectionControl.review.nextReviewDate")}
            value={values.nextReview}
            onChange={(value) => {
              setFieldValue("nextReview", value);
              setFieldError("nextReviewDate", undefined);
            }}
            options={nextReviewOptions.map((option) => ({
              value: option,
              label: option.startsWith("days")
                ? t("infectionControl.review.nextReviewDays", {
                    count: Number(option.replace("days", "")),
                  })
                : t(`infectionControl.review.nextReview.${option}`),
              date:
                option === "date"
                  ? null
                  : formatDate(getNextReviewDate(values, option), "DD/MM"),
            }))}
          />
          {values.nextReview === "date" && (
            <DatePicker
              format="DD/MM/YYYY"
              value={values.nextReviewDate}
              onChange={(value: Dayjs | null) => {
                setFieldValue("nextReviewDate", value);
                setFieldError("nextReviewDate", undefined);
              }}
              disabledDate={notAfterToday}
              aria-label={t("infectionControl.review.nextReviewDate")}
            />
          )}
        </div>
        {errors.nextReviewDate ? (
          <div className="summary-error">{errors.nextReviewDate as string}</div>
        ) : (
          <div className="summary-info">
            {t("infectionControl.review.nextReviewDateHelp")}
          </div>
        )}
      </section>

      <section className="summary-section">
        <div className="summary-notes-header">
          <label className="summary-section-title" htmlFor="review-notes">
            {t("infectionControl.review.notes")}
          </label>
          <span className="summary-hint">
            {t("infectionControl.review.optional")}
          </span>
        </div>
        <Textarea
          id="review-notes"
          autoSize={{ minRows: 3, maxRows: 8 }}
          placeholder={t("infectionControl.review.notesPlaceholder")}
          value={values.notes}
          onChange={(e: any) => setFieldValue("notes", e.target.value)}
        />
      </section>

      <section
        className="summary-section"
        data-kb="infectionControl.review.summary"
      >
        <h4 className="summary-section-title">
          {t("infectionControl.review.summary")}
        </h4>
        {drugCount === 0 ? (
          <div className="summary-empty">
            {t("infectionControl.review.noOngoing")}
          </div>
        ) : (
          <ul className="summary-list" data-testid="review-summary">
            {values.evaluations.map((evaluation, index) => (
              <li key={evaluation.idDrug} className="summary-drug">
                <div className="summary-drug-text">
                  <span className="summary-drug-name">{evaluation.drug}</span>
                  <span className="summary-drug-detail">
                    {describeDrugEvaluation(
                      evaluation,
                      invalidatedEvaluations,
                      t,
                    )}
                  </span>
                </div>
                <div className="summary-drug-actions">
                  <Tag color={drugStatus[index].color}>
                    {drugStatus[index].label}
                  </Tag>
                  <button
                    type="button"
                    className="link-button"
                    aria-label={t("infectionControl.review.editDrug", {
                      drug: evaluation.drug,
                    })}
                    onClick={() => onSelectStep(index)}
                  >
                    {t("actions.edit")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </ReviewSummary>
  );
}
