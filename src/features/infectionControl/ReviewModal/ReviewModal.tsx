import { useEffect, useMemo, useState } from "react";
import { Formik } from "formik";
import { useTranslation } from "react-i18next";
import { LeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { Dayjs } from "dayjs";

import DefaultModal from "components/Modal";
import notification from "components/notification";
import Feature from "models/Feature";
import { FeatureService } from "services/FeatureService";
import { useAppDispatch, useAppSelector } from "src/store";
import { getErrorMessage } from "utils/errorHandler";
import { Form } from "styles/Form.style";

import {
  fetchClinicalNoteTypes,
  fetchInterventionReasons,
  IAntimicrobialTimeline,
  ICourse,
  IFollowUp,
  IFollowUpCourse,
  saveReview,
  setReviewOpen,
} from "../InfectionControlSlice";
import { courseKey, getInvalidatedEvaluations } from "../followUp";
import {
  ClinicalNoteStep,
  ClinicalNoteUnavailable,
} from "./ClinicalNoteStep/ClinicalNoteStep";
import { DrugEvaluationStep } from "./DrugEvaluationStep/DrugEvaluationStep";
import { ReviewRail } from "./ReviewRail/ReviewRail";
import { ReviewSummaryStep } from "./ReviewSummaryStep/ReviewSummaryStep";
import {
  findEvaluatedCourse,
  getDecision,
  getEvaluationSchema,
  getInitialValues,
  getSkipOutcome,
  getValidationSchema,
  IReviewFields,
  toReviewPayload,
  validateClinicalNote,
  validateDrug,
} from "./reviewForm";
import { ReviewBody } from "./ReviewModal.style";

interface ReviewModalProps {
  followUp: IFollowUp;
  // the patient, the courses and the exams the clinical note tells about
  timeline: IAntimicrobialTimeline;
  // the antimicrobial timeline of the admission, plotted for each drug
  courses: ICourse[];
  dischargeDate: string | null;
  drugNames: Record<number, string>;
  now: Dayjs;
}

/**
 * The infectologist's review of the patient, one step per running
 * antimicrobial - its timeline, its current evaluation and a new verdict,
 * conforming, not conforming or left out, valid until a date - then a step to
 * schedule the next review and a last, optional one for the clinical note the
 * review writes in the patient's record. Drugs without an evaluation in force
 * (none, expired or with a changed posology) are to be evaluated; the others
 * keep it unless evaluated again.
 */
export function ReviewModal({
  followUp,
  timeline,
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
  const reasons = useAppSelector(
    (state) => state.infectionControl.interventionReasons.list,
  );
  const clinicalNoteTypes = useAppSelector(
    (state) => state.infectionControl.clinicalNoteTypes,
  );
  const cultures = useAppSelector((state) => state.infectionControl.cultures);
  // the user ducks are untyped legacy JS
  const account = useAppSelector((state: any) => state.user.account);
  const isSaving = status === "loading";
  const hasMultiClinicalNotes = FeatureService.has(
    Feature.MULTI_CLINICAL_NOTES,
  );
  const [step, setStep] = useState(0);

  // every review starts at the first drug
  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  // the reasons a non-conformity can be given and the types of a note
  useEffect(() => {
    if (open) {
      dispatch(fetchInterventionReasons());
      if (hasMultiClinicalNotes) dispatch(fetchClinicalNoteTypes());
    }
  }, [open, hasMultiClinicalNotes, dispatch]);

  // a note is written on the prescription-day of the record, with a type,
  // only where the schema has the multiple clinical notes
  let noteUnavailable: ClinicalNoteUnavailable | null = null;
  if (!followUp.idPrescription) {
    noteUnavailable = "noPrescription";
  } else if (!hasMultiClinicalNotes) {
    noteUnavailable = "noFeature";
  } else if (clinicalNoteTypes.status === "failed") {
    noteUnavailable = "error";
  } else if (clinicalNoteTypes.status !== "succeeded") {
    noteUnavailable = "loading";
  }

  // open reasons that make the evaluation on record of a drug no longer hold
  const invalidatedEvaluations = useMemo(
    () => getInvalidatedEvaluations(followUp),
    [followUp],
  );

  // what the variables of the note are read from
  const noteContext = {
    timeline,
    cultures:
      cultures.status === "succeeded"
        ? (cultures.data?.cultures ?? null)
        : null,
    reasons,
    invalidatedEvaluations,
    userName: account?.userName || null,
    signature: account?.signature || null,
  };

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
  const evaluationSchema = useMemo(
    () => getEvaluationSchema(t, reasons),
    [t, reasons],
  );
  const validationSchema = useMemo(
    () => getValidationSchema(t, evaluationSchema),
    [t, evaluationSchema],
  );

  const onClose = () => {
    dispatch(setReviewOpen(false));
  };

  const onSave = (values: IReviewFields) => {
    dispatch(
      saveReview(
        toReviewPayload(
          values,
          followUp.admissionNumber,
          reasons,
          !noteUnavailable,
        ),
      ),
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
      {({ values, submitForm, validateForm }) => {
        const drugCount = values.evaluations.length;
        const patientStep = drugCount;
        // the clinical note closes the review
        const lastStep = patientStep + 1;
        const isPatientStep = step === patientStep;
        const isNoteStep = step === lastStep;

        // what keeps each drug from being done, checked as it is filled
        const drugErrors = values.evaluations.map((evaluation) =>
          validateDrug(evaluationSchema, evaluation),
        );
        const allDrugsDone = drugErrors.every((drugError) => !drugError);
        // what keeps the note from being saved; nothing when none can be
        // written, and the review is saved without it
        const noteError = noteUnavailable
          ? null
          : validateClinicalNote(values.clinicalNote);

        // what is chosen for each drug, as a tag
        const drugStatus = values.evaluations.map((evaluation) => {
          const decision = getDecision(evaluation);
          if (decision === "skip") {
            const outcome = getSkipOutcome(evaluation, invalidatedEvaluations);
            return {
              label: t(`infectionControl.review.skip.${outcome}.tag`),
              color: outcome === "keepInvalid" ? "orange" : "default",
            };
          }
          if (decision == null) {
            return {
              label: t("infectionControl.review.toEvaluate"),
              color: "orange",
            };
          }

          return decision === "conforming"
            ? {
                label: t("infectionControl.evaluation.conforming"),
                color: "green",
              }
            : {
                label: t("infectionControl.evaluation.nonConforming"),
                color: "red",
              };
        });

        const railDrugs = values.evaluations.map((evaluation, index) => {
          const course = findEvaluatedCourse(
            drugTimelines[evaluation.idDrug]?.courses,
            evaluation,
          );

          return {
            key: evaluation.idDrug,
            title: evaluation.drug,
            day:
              course &&
              (course.plannedDays != null
                ? t("infectionControl.timeline.dayPlanned", {
                    count: course.days,
                    planned: course.plannedDays,
                  })
                : t("infectionControl.timeline.day", { count: course.days })),
            status: drugStatus[index],
            done: index !== step && !drugErrors[index],
          };
        });

        let noteStatus: { label: string; color?: string };
        if (noteUnavailable && noteUnavailable !== "loading") {
          noteStatus = { label: t("infectionControl.clinicalNote.tag.none") };
        } else if (!values.clinicalNote.create) {
          noteStatus = { label: t("infectionControl.clinicalNote.tag.skip") };
        } else {
          noteStatus = {
            label: t("infectionControl.clinicalNote.tag.create"),
            color: "blue",
          };
        }

        const save = () => {
          validateForm().then((formErrors) => {
            // the date is chosen on the patient step: back there to fix it
            if (formErrors.nextReviewDate) {
              setStep(patientStep);
            } else if (!formErrors.evaluations) {
              submitForm();
            }
          });
        };

        // why the step cannot move on yet
        let hint: { text: string; error: boolean } | null = null;
        if (isPatientStep || isNoteStep) {
          if (!allDrugsDone) {
            hint = {
              text: t("infectionControl.review.hintAllDrugs"),
              error: isNoteStep,
            };
          } else if (isNoteStep && noteError) {
            hint = {
              text: t(
                noteError === "text"
                  ? "infectionControl.clinicalNote.hintText"
                  : "infectionControl.clinicalNote.hintType",
              ),
              error: true,
            };
          }
        } else {
          const stepErrors = drugErrors[step];
          if (stepErrors?.conforming) {
            hint = {
              text: t("infectionControl.review.hintDecision"),
              error: false,
            };
          } else if (stepErrors?.interventionReasons) {
            hint = {
              text: t("infectionControl.review.hintReasons"),
              error: true,
            };
          } else if (stepErrors?.substituteDrug) {
            hint = {
              text: t("infectionControl.review.hintSubstitute"),
              error: true,
            };
          } else if (stepErrors?.notes) {
            hint = {
              text: t("infectionControl.review.hintJustification"),
              error: true,
            };
          } else if (stepErrors) {
            hint = {
              text: t("infectionControl.review.hintValidity"),
              error: true,
            };
          }
        }
        let canMoveOn = !drugErrors[step];
        if (isPatientStep) {
          canMoveOn = true;
        } else if (isNoteStep) {
          canMoveOn =
            allDrugsDone && noteUnavailable !== "loading" && !noteError;
        }
        const moveOn = () => {
          if (!canMoveOn) return;
          if (isNoteStep) save();
          else setStep(step + 1);
        };

        return (
          <DefaultModal
            open={open}
            width={1120}
            centered
            destroyOnHidden
            onCancel={onClose}
            footer={null}
            maskClosable={false}
            styles={{ container: { padding: 0, overflow: "hidden" } }}
          >
            <ReviewBody data-kb="infectionControl.review">
              <header className="review-header">
                <h2 className="review-title">
                  {t("infectionControl.review.title")}
                </h2>
                <p className="review-legend">
                  {t("infectionControl.review.legend")}
                </p>
              </header>

              <div className="review-layout">
                <ReviewRail
                  drugs={railDrugs}
                  step={step}
                  noteStatus={noteStatus}
                  onSelect={setStep}
                />

                <Form
                  className="review-step"
                  onSubmit={(event: React.FormEvent) => {
                    // Enter moves on, the save is only on the last step
                    event.preventDefault();
                    moveOn();
                  }}
                >
                  {isNoteStep && (
                    <ClinicalNoteStep
                      unavailable={noteUnavailable}
                      types={clinicalNoteTypes.list}
                      context={noteContext}
                    />
                  )}
                  {isPatientStep && <ReviewSummaryStep />}
                  {step < patientStep && (
                    <DrugEvaluationStep
                      key={values.evaluations[step].idDrug}
                      index={step}
                      timeline={drugTimelines[values.evaluations[step].idDrug]}
                      invalidatedEvaluations={invalidatedEvaluations}
                      drugErrors={drugErrors[step]}
                      dischargeDate={dischargeDate}
                      now={now}
                    />
                  )}
                  {/* lets Enter submit with more than one field (a field
                      alone submits by itself); the reasons select keeps its
                      Enter to pick an option */}
                  <button type="submit" hidden />
                </Form>
              </div>

              <footer className="review-footer">
                <div className="review-footer-status">
                  <span className="review-footer-step">
                    {t("infectionControl.review.stepOf", {
                      step: step + 1,
                      total: lastStep + 1,
                    })}
                  </span>
                  {hint && (
                    <span
                      className={`review-footer-hint ${hint.error ? "error" : ""}`}
                      data-testid="review-hint"
                    >
                      {hint.text}
                    </span>
                  )}
                </div>
                <div className="review-footer-actions">
                  <Button type="text" onClick={onClose} disabled={isSaving}>
                    {t("actions.cancel")}
                  </Button>
                  {step > 0 && (
                    <Button
                      icon={<LeftOutlined />}
                      onClick={() => setStep(step - 1)}
                      disabled={isSaving}
                    >
                      {t("actions.back")}
                    </Button>
                  )}
                  <Button
                    type="primary"
                    onClick={moveOn}
                    disabled={!canMoveOn}
                    loading={isNoteStep && isSaving}
                  >
                    {t(
                      isNoteStep
                        ? "infectionControl.review.save"
                        : isPatientStep
                          ? "infectionControl.clinicalNote.next"
                          : step === patientStep - 1
                            ? "infectionControl.review.nextPatient"
                            : "infectionControl.review.nextDrug",
                    )}
                  </Button>
                </div>
              </footer>
            </ReviewBody>
          </DefaultModal>
        );
      }}
    </Formik>
  );
}
