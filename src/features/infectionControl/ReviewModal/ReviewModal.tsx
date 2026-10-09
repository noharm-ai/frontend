import { useEffect, useMemo, useState } from "react";
import { Formik, FormikErrors } from "formik";
import { useTranslation } from "react-i18next";
import { Button, Steps } from "antd";
import { Dayjs } from "dayjs";

import DefaultModal from "components/Modal";
import notification from "components/notification";
import { useAppDispatch, useAppSelector } from "src/store";
import { getErrorMessage } from "utils/errorHandler";
import { Form } from "styles/Form.style";

import {
  ICourse,
  IFollowUp,
  IFollowUpCourse,
  saveReview,
  setReviewOpen,
} from "../InfectionControlSlice";
import { courseKey, getInvalidatedEvaluations } from "../followUp";
import { DrugEvaluationStep } from "./DrugEvaluationStep/DrugEvaluationStep";
import { ReviewSummaryStep } from "./ReviewSummaryStep/ReviewSummaryStep";
import {
  describeDrugEvaluation,
  getEvaluationSchema,
  getInitialValues,
  getValidationSchema,
  getValidUntil,
  IDrugEvaluationFields,
  IReviewFields,
  toReviewPayload,
  validateDrug,
} from "./reviewForm";
import { ReviewBody } from "./ReviewModal.style";

interface ReviewModalProps {
  followUp: IFollowUp;
  // the antimicrobial timeline of the admission, plotted for each drug
  courses: ICourse[];
  dischargeDate: string | null;
  drugNames: Record<number, string>;
  now: Dayjs;
}

/**
 * The infectologist's review of the patient, one step per running
 * antimicrobial - its timeline, its current evaluation and a new verdict,
 * conforming or not and valid until a date - and a last step to schedule the
 * next review. Drugs without an evaluation in force (none, expired or with a
 * changed posology) come selected; the others can be evaluated again.
 */
export function ReviewModal({
  followUp,
  courses,
  dischargeDate,
  drugNames,
  now,
}: ReviewModalProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { open, status } = useAppSelector(
    (state) => state.infectionControl.review,
  );
  const isSaving = status === "loading";
  const [step, setStep] = useState(0);

  // every review starts at the first drug
  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  // open reasons that make the evaluation on record of a drug no longer hold
  const invalidatedEvaluations = useMemo(
    () => getInvalidatedEvaluations(followUp),
    [followUp],
  );

  // the timeline of each drug and the follow-up of its courses
  const drugTimelines = useMemo(() => {
    const byDrug: Record<
      number,
      { courses: ICourse[]; followUps: Record<string, IFollowUpCourse> }
    > = {};
    courses.forEach((course) => {
      byDrug[course.idDrug] ??= { courses: [], followUps: {} };
      byDrug[course.idDrug].courses.push(course);
    });
    (followUp.courses ?? []).forEach((course) => {
      if (byDrug[course.idDrug]) {
        byDrug[course.idDrug].followUps[
          courseKey(course.idDrug, course.start)
        ] = course;
      }
    });

    return byDrug;
  }, [courses, followUp]);

  const initialValues = useMemo(
    () => getInitialValues(followUp, courses, drugNames),
    [followUp, courses, drugNames],
  );
  const evaluationSchema = useMemo(() => getEvaluationSchema(t), [t]);
  const validationSchema = useMemo(
    () => getValidationSchema(t, evaluationSchema),
    [t, evaluationSchema],
  );

  const onClose = () => {
    dispatch(setReviewOpen(false));
  };

  const onSave = (values: IReviewFields) => {
    dispatch(
      saveReview(toReviewPayload(values, followUp.admissionNumber)),
    ).then((response: any) => {
      if (response.error) {
        notification.error({ message: getErrorMessage(response, t) });
      } else {
        notification.success({
          message: t("infectionControl.review.success"),
        });
      }
    });
  };

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
      {({ values, errors, setErrors, submitForm, validateForm }) => {
        const drugCount = values.evaluations.length;
        const lastStep = drugCount;
        const isReviewStep = step === lastStep;

        // flags (or clears) the errors of one drug, keeping the others
        const setDrugErrors = (
          index: number,
          drugErrors: FormikErrors<IDrugEvaluationFields> | null,
        ) => {
          const list = [
            ...((errors.evaluations as FormikErrors<IDrugEvaluationFields>[]) ??
              []),
          ];
          list[index] = drugErrors ?? (undefined as any);
          setErrors({
            ...errors,
            evaluations: list.some(Boolean) ? (list as any) : undefined,
          });
        };

        // moving forward checks the drug being left
        const goTo = (target: number) => {
          if (target > step && step < lastStep) {
            const drugErrors = validateDrug(
              evaluationSchema,
              values.evaluations[step],
            );
            setDrugErrors(step, drugErrors);
            if (drugErrors) return;
          }
          setStep(target);
        };

        const save = () => {
          validateForm().then((formErrors) => {
            const evaluationsWithError = (formErrors.evaluations ??
              []) as unknown[];
            const firstDrugWithError = values.evaluations.findIndex(
              (_, index) => !!evaluationsWithError[index],
            );
            if (firstDrugWithError >= 0) {
              setStep(firstDrugWithError);
            } else if (!formErrors.nextReviewDate) {
              submitForm();
            }
          });
        };

        const stepItems = [
          ...values.evaluations.map((evaluation, index) => {
            const done = evaluation.evaluate
              ? evaluation.conforming != null && !!getValidUntil(evaluation)
              : index < step;
            let stepStatus: "wait" | "process" | "finish" | "error" = "wait";
            if (index === step) stepStatus = "process";
            else if (errors.evaluations?.[index]) stepStatus = "error";
            else if (done) stepStatus = "finish";

            return {
              key: evaluation.idDrug,
              title: (
                <span className="step-title" title={evaluation.drug}>
                  {evaluation.drug}
                </span>
              ),
              content: describeDrugEvaluation(
                evaluation,
                invalidatedEvaluations,
                t,
              ),
              status: stepStatus,
            };
          }),
          {
            key: "review",
            title: t("infectionControl.review.patientStep"),
            content: t("infectionControl.review.patientStepLegend"),
            status: (isReviewStep ? "process" : "wait") as "process" | "wait",
          },
        ];

        const footer = [
          <Button key="cancel" onClick={onClose} disabled={isSaving}>
            {t("actions.cancel")}
          </Button>,
          <Button
            key="back"
            onClick={() => setStep(step - 1)}
            disabled={step === 0 || isSaving}
          >
            {t("actions.back")}
          </Button>,
          isReviewStep ? (
            <Button key="save" type="primary" onClick={save} loading={isSaving}>
              {t("actions.save")}
            </Button>
          ) : (
            <Button key="next" type="primary" onClick={() => goTo(step + 1)}>
              {t("infectionControl.review.next")}
            </Button>
          ),
        ];

        return (
          <DefaultModal
            open={open}
            width={1040}
            centered
            destroyOnHidden
            onCancel={onClose}
            footer={footer}
            maskClosable={false}
          >
            <ReviewBody data-kb="infectionControl.review">
              <h2 className="modal-title">
                {t("infectionControl.review.title")}
              </h2>
              <p className="review-legend">
                {t("infectionControl.review.legend")}
              </p>

              <div className="review-layout">
                <Steps
                  className="review-steps"
                  orientation="vertical"
                  size="small"
                  current={step}
                  onChange={goTo}
                  items={stepItems}
                />

                <Form
                  className="review-step"
                  onSubmit={(event: React.FormEvent) => {
                    // Enter moves on, the save is only on the last step
                    event.preventDefault();
                    if (isReviewStep) save();
                    else goTo(step + 1);
                  }}
                >
                  {isReviewStep ? (
                    <ReviewSummaryStep
                      invalidatedEvaluations={invalidatedEvaluations}
                      onSelectStep={setStep}
                    />
                  ) : (
                    <DrugEvaluationStep
                      key={values.evaluations[step].idDrug}
                      index={step}
                      timeline={drugTimelines[values.evaluations[step].idDrug]}
                      invalidatedEvaluations={invalidatedEvaluations}
                      dischargeDate={dischargeDate}
                      now={now}
                    />
                  )}
                </Form>
              </div>
            </ReviewBody>
          </DefaultModal>
        );
      }}
    </Formik>
  );
}
