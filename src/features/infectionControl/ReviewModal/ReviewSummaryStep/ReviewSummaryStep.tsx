import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";
import dayjs, { Dayjs } from "dayjs";

import { DatePicker, Textarea } from "components/Inputs";

import { IFollowUpPending } from "../../InfectionControlSlice";
import { describeDrugEvaluation, IReviewFields } from "../reviewForm";

interface ReviewSummaryStepProps {
  // open reasons that make an evaluation on record no longer hold, by id
  invalidatedEvaluations: Record<string, IFollowUpPending[]>;
  // goes back to the step of a drug
  onSelectStep: (index: number) => void;
}

const notAfterToday = (current: Dayjs) =>
  !!current && !current.isAfter(dayjs(), "day");

/**
 * The last step of the review: what it records for each drug, the next
 * review date and the notes about the patient
 */
export function ReviewSummaryStep({
  invalidatedEvaluations,
  onSelectStep,
}: ReviewSummaryStepProps) {
  const { t } = useTranslation();
  const { values, errors, setFieldValue, setFieldError } =
    useFormikContext<IReviewFields>();
  const drugCount = values.evaluations.length;

  return (
    <>
      {drugCount === 0 ? (
        <div className="review-empty">
          {t("infectionControl.review.noOngoing")}
        </div>
      ) : (
        <div className="review-summary" data-testid="review-summary">
          <h3 className="review-section-title">
            {t("infectionControl.review.antimicrobials")}
          </h3>
          <ul>
            {values.evaluations.map((evaluation, index) => (
              <li key={evaluation.idDrug}>
                <button
                  type="button"
                  className="review-summary-drug"
                  onClick={() => onSelectStep(index)}
                >
                  {evaluation.drug}
                </button>
                <span>
                  {describeDrugEvaluation(
                    evaluation,
                    invalidatedEvaluations,
                    t,
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={`form-row ${errors.nextReviewDate ? "error" : ""}`}>
        <div className="form-label">
          <label>
            {t("infectionControl.review.nextReviewDate")}{" "}
            <span className="form-label-optional">
              ({t("infectionControl.review.optional")})
            </span>
          </label>
        </div>
        <div className="form-input">
          <DatePicker
            format="DD/MM/YYYY"
            value={values.nextReviewDate}
            onChange={(value: Dayjs | null) => {
              setFieldValue("nextReviewDate", value);
              setFieldError("nextReviewDate", undefined);
            }}
            disabledDate={notAfterToday}
            placeholder={t("infectionControl.review.noSchedule")}
            aria-label={t("infectionControl.review.nextReviewDate")}
          />
        </div>
        {errors.nextReviewDate ? (
          <div className="form-error">{errors.nextReviewDate as string}</div>
        ) : (
          <div className="form-info">
            {t("infectionControl.review.nextReviewDateHelp")}
          </div>
        )}
      </div>

      <div className="form-row">
        <div className="form-label">
          <label>
            {t("infectionControl.review.notes")}{" "}
            <span className="form-label-optional">
              ({t("infectionControl.review.optional")})
            </span>
          </label>
        </div>
        <div className="form-input">
          <Textarea
            aria-label={t("infectionControl.review.notes")}
            autoSize={{ minRows: 3, maxRows: 8 }}
            value={values.notes}
            onChange={(e: any) => setFieldValue("notes", e.target.value)}
          />
        </div>
      </div>
    </>
  );
}
