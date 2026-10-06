import { Formik, FormikErrors } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { Radio } from "antd";
import dayjs, { Dayjs } from "dayjs";

import DefaultModal from "components/Modal";
import notification from "components/notification";
import { Checkbox, DatePicker, Textarea } from "components/Inputs";
import { useAppDispatch, useAppSelector } from "src/store";
import { getErrorMessage } from "utils/errorHandler";
import { Form } from "styles/Form.style";

import {
  IAntimicrobialEvaluation,
  IFollowUp,
  saveReview,
  setReviewOpen,
} from "../InfectionControlSlice";
import { EvaluationTag } from "../EvaluationTag/EvaluationTag";
import { DrugEvaluation, ReviewBody } from "./ReviewModal.style";

// quick picks for how long an evaluation holds
const VALIDITY_PRESETS = [3, 7, 14];

interface IDrugEvaluationFields {
  idDrug: number;
  drug: string;
  current: IAntimicrobialEvaluation | null;
  evaluate: boolean;
  conforming: boolean | null;
  validUntil: Dayjs | null;
  notes: string;
}

interface IReviewFields {
  notes: string;
  nextReviewDate: Dayjs | null;
  evaluations: IDrugEvaluationFields[];
}

interface ReviewModalProps {
  followUp: IFollowUp;
  drugNames: Record<number, string>;
  now: Dayjs;
}

/**
 * The infectologist's review of the patient: judge each running antimicrobial
 * conforming or not (valid until a date) and schedule the next review. Drugs
 * without an evaluation come selected; the ones already evaluated can be
 * evaluated again.
 */
export function ReviewModal({ followUp, drugNames, now }: ReviewModalProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { open, status } = useAppSelector(
    (state) => state.infectionControl.review,
  );
  const isSaving = status === "loading";

  const ongoing = (followUp.courses ?? []).filter((course) => course.ongoing);

  const initialValues: IReviewFields = {
    notes: "",
    nextReviewDate: null,
    evaluations: ongoing.map((course) => ({
      idDrug: course.idDrug,
      drug: drugNames[course.idDrug] ?? `${course.idDrug}`,
      current: course.evaluation,
      evaluate: !course.evaluation,
      conforming: null,
      validUntil: null,
      notes: "",
    })),
  };

  const futureDate = (value: Dayjs | null | undefined) =>
    !value || value.isAfter(dayjs());

  const validationSchema = Yup.object().shape({
    nextReviewDate: Yup.mixed<Dayjs>()
      .nullable()
      .test("future", t("infectionControl.review.futureDate"), futureDate),
    evaluations: Yup.array().of(
      Yup.object().shape({
        evaluate: Yup.boolean(),
        conforming: Yup.boolean()
          .nullable()
          .when("evaluate", {
            is: true,
            then: (schema) => schema.required(t("validation.requiredField")),
          }),
        validUntil: Yup.mixed<Dayjs>()
          .nullable()
          .when("evaluate", {
            is: true,
            then: (schema) =>
              schema
                .required(t("validation.requiredField"))
                .test(
                  "future",
                  t("infectionControl.review.futureDate"),
                  futureDate,
                ),
          }),
      }),
    ),
  });

  const onClose = () => {
    dispatch(setReviewOpen(false));
  };

  const onSave = (values: IReviewFields) => {
    const payload = {
      admissionNumber: followUp.admissionNumber,
      notes: values.notes.trim() || null,
      // the patient is due from the start of the scheduled day
      nextReviewDate: values.nextReviewDate
        ? values.nextReviewDate.startOf("day").format("YYYY-MM-DDTHH:mm:ss")
        : null,
      evaluations: values.evaluations
        .filter((e) => e.evaluate)
        .map((e) => ({
          idDrug: e.idDrug,
          conforming: !!e.conforming,
          notes: e.notes.trim() || null,
          // the evaluation holds through the whole chosen day
          validUntil: e.validUntil!.endOf("day").format("YYYY-MM-DDTHH:mm:ss"),
        })),
    };

    dispatch(saveReview(payload)).then((response: any) => {
      if (response.error) {
        notification.error({ message: getErrorMessage(response, t) });
      } else {
        notification.success({
          message: t("infectionControl.review.success"),
        });
      }
    });
  };

  const presets = VALIDITY_PRESETS.map((days) => ({
    label: t("infectionControl.review.presetDays", { count: days }),
    value: dayjs().add(days, "day"),
  }));
  const beforeToday = (current: Dayjs) =>
    !!current && current.isBefore(dayjs(), "day");
  const notAfterToday = (current: Dayjs) =>
    !!current && !current.isAfter(dayjs(), "day");

  return (
    <Formik
      // a fresh form each time the modal opens
      key={open ? "open" : "closed"}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSave}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ values, errors, setFieldValue, handleSubmit }) => {
        const evaluationErrors = (index: number) =>
          (errors.evaluations?.[index] ??
            {}) as FormikErrors<IDrugEvaluationFields>;

        return (
          <DefaultModal
            open={open}
            width={720}
            centered
            destroyOnHidden
            onCancel={onClose}
            onOk={() => handleSubmit()}
            okText={t("actions.save")}
            cancelText={t("actions.cancel")}
            confirmLoading={isSaving}
            okButtonProps={{ disabled: isSaving }}
            cancelButtonProps={{ disabled: isSaving }}
            maskClosable={false}
          >
            <ReviewBody data-kb="infectionControl.review">
              <h2 className="modal-title">
                {t("infectionControl.review.title")}
              </h2>
              <p className="review-legend">
                {t("infectionControl.review.legend")}
              </p>

              <Form onSubmit={handleSubmit}>
                <h3 className="review-section-title">
                  {t("infectionControl.review.antimicrobials")}
                </h3>

                {values.evaluations.length === 0 && (
                  <div className="review-empty">
                    {t("infectionControl.review.noOngoing")}
                  </div>
                )}

                {values.evaluations.map((evaluation, index) => {
                  const fieldErrors = evaluationErrors(index);
                  const field = (name: string) =>
                    `evaluations.${index}.${name}`;

                  return (
                    <DrugEvaluation
                      key={evaluation.idDrug}
                      $selected={evaluation.evaluate}
                      data-testid="review-drug"
                    >
                      <div className="drug-header">
                        <Checkbox
                          checked={evaluation.evaluate}
                          onChange={(e: any) =>
                            setFieldValue(field("evaluate"), e.target.checked)
                          }
                        >
                          <span className="drug-name">{evaluation.drug}</span>
                        </Checkbox>
                        <EvaluationTag
                          evaluation={evaluation.current}
                          now={now}
                        />
                      </div>

                      {evaluation.evaluate && (
                        <div className="drug-fields">
                          <div>
                            <span className="drug-field-label">
                              {t("infectionControl.review.conformity")}
                            </span>
                            <Radio.Group
                              optionType="button"
                              buttonStyle="solid"
                              value={evaluation.conforming}
                              onChange={(e) =>
                                setFieldValue(
                                  field("conforming"),
                                  e.target.value,
                                )
                              }
                              options={[
                                {
                                  value: true,
                                  label: t(
                                    "infectionControl.evaluation.conforming",
                                  ),
                                },
                                {
                                  value: false,
                                  label: t(
                                    "infectionControl.evaluation.nonConforming",
                                  ),
                                },
                              ]}
                            />
                            {fieldErrors.conforming && (
                              <div className="drug-field-error">
                                {fieldErrors.conforming}
                              </div>
                            )}
                          </div>

                          <div>
                            <span className="drug-field-label">
                              {t("infectionControl.review.validUntil")}
                            </span>
                            <DatePicker
                              format="DD/MM/YYYY"
                              value={evaluation.validUntil}
                              onChange={(value: Dayjs | null) =>
                                setFieldValue(field("validUntil"), value)
                              }
                              presets={presets}
                              disabledDate={beforeToday}
                              aria-label={t(
                                "infectionControl.review.validUntil",
                              )}
                            />
                            {fieldErrors.validUntil && (
                              <div className="drug-field-error">
                                {fieldErrors.validUntil as string}
                              </div>
                            )}
                          </div>

                          <div className="drug-field-notes">
                            <span className="drug-field-label">
                              {t("infectionControl.review.evaluationNotes")}
                            </span>
                            <Textarea
                              aria-label={t(
                                "infectionControl.review.evaluationNotes",
                              )}
                              autoSize={{ minRows: 1, maxRows: 4 }}
                              value={evaluation.notes}
                              onChange={(e: any) =>
                                setFieldValue(field("notes"), e.target.value)
                              }
                            />
                          </div>
                        </div>
                      )}
                    </DrugEvaluation>
                  );
                })}

                <div
                  className={`form-row ${errors.nextReviewDate ? "error" : ""}`}
                >
                  <div className="form-label">
                    <label>{t("infectionControl.review.nextReviewDate")}</label>
                  </div>
                  <div className="form-input">
                    <DatePicker
                      format="DD/MM/YYYY"
                      value={values.nextReviewDate}
                      onChange={(value: Dayjs | null) =>
                        setFieldValue("nextReviewDate", value)
                      }
                      disabledDate={notAfterToday}
                      aria-label={t("infectionControl.review.nextReviewDate")}
                    />
                  </div>
                  {errors.nextReviewDate && (
                    <div className="form-error">
                      {errors.nextReviewDate as string}
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-label">
                    <label>{t("infectionControl.review.notes")}</label>
                  </div>
                  <div className="form-input">
                    <Textarea
                      aria-label={t("infectionControl.review.notes")}
                      autoSize={{ minRows: 3, maxRows: 8 }}
                      value={values.notes}
                      onChange={(e: any) =>
                        setFieldValue("notes", e.target.value)
                      }
                    />
                  </div>
                </div>
              </Form>
            </ReviewBody>
          </DefaultModal>
        );
      }}
    </Formik>
  );
}
