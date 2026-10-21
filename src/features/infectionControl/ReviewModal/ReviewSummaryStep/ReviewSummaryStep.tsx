import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";
import dayjs, { Dayjs } from "dayjs";

import { DatePicker, Textarea } from "components/Inputs";
import { formatDate } from "utils/date";

import { ChoiceChips } from "../ChoiceChips/ChoiceChips";
import {
  getNextReviewDate,
  getTreatmentsEnd,
  IReviewFields,
  NEXT_REVIEW_DAYS,
  NextReview,
} from "../reviewForm";
import { ReviewSummary } from "../ReviewModal.style";

const notAfterToday = (current: Dayjs) =>
  !!current && !current.isAfter(dayjs(), "day");

/**
 * The patient step of the review: when the patient is reviewed again and the
 * notes about the patient
 */
export function ReviewSummaryStep() {
  const { t } = useTranslation();
  const { values, errors, setFieldValue, setFieldError } =
    useFormikContext<IReviewFields>();
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
    </ReviewSummary>
  );
}
