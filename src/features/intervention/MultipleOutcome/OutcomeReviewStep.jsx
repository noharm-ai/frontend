import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as Yup from "yup";

import Button from "components/Button";
import Heading from "components/Heading";
import notification from "components/notification";
import InterventionOutcomeForm from "features/intervention/InterventionOutcome/Form/InterventionOutcomeForm";
import { buildOutcomeInitialValues } from "features/intervention/InterventionOutcome/outcomeValues";
import { updateInterventionStatusThunk } from "store/ducks/prescriptions/thunk";
import { updateInterventionListStatusThunk } from "store/ducks/intervention/thunk";
import { getErrorMessage } from "utils/errorHandler";
import {
  applyOutcomeMultiple,
  addResult,
  nextReviewItem,
  setStage,
} from "./MultipleOutcomeSlice";

import { Form } from "styles/Form.style";
import { ModalFooter } from "styles/Utils.style";

export function OutcomeReviewStep() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const outcome = useSelector(
    (state) => state.multipleInterventionOutcome.outcome,
  );
  const reviewQueue = useSelector(
    (state) => state.multipleInterventionOutcome.reviewQueue,
  );
  const reviewIndex = useSelector(
    (state) => state.multipleInterventionOutcome.reviewIndex,
  );
  const saving = useSelector(
    (state) => state.multipleInterventionOutcome.saveStatus === "loading",
  );

  const item = reviewQueue[reviewIndex];
  const outcomeData = item.outcomeData;
  const drugName = outcomeData.header?.originDrug;
  const isSubstitution = outcomeData.header?.economyType === 2;

  const manualRequiredWithoutDestiny = (schema) =>
    isSubstitution
      ? schema.when("idPrescriptionDrugDestiny", {
          is: (value) => value == null,
          then: (s) =>
            s.oneOf([true], t("multipleIntervention.manualRequired")),
        })
      : schema;

  const validationSchema = Yup.object().shape({
    idIntervention: Yup.number()
      .nullable()
      .required(t("validation.requiredField")),
    outcome: Yup.string().nullable().required(t("validation.requiredField")),
    economyDayValue: Yup.mixed()
      .nullable()
      .when("economyDayValueManual", {
        is: true,
        then: (schema) =>
          schema.test(
            "required",
            t("validation.requiredField"),
            (value) => value != null && `${value}` !== "",
          ),
      }),
    economyDayAmount: Yup.number()
      .nullable()
      .when("economyDayAmountManual", {
        is: true,
        then: (schema) =>
          schema
            .required(t("validation.requiredField"))
            .min(1, t("validation.requiredField")),
      }),
    economyDayValueManual: manualRequiredWithoutDestiny(Yup.boolean()),
    economyDayAmountManual: manualRequiredWithoutDestiny(Yup.boolean()),
  });

  const confirmStep = (values) => {
    dispatch(applyOutcomeMultiple(values)).then((response) => {
      if (response.payload?.status !== "success") {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        dispatch(
          addResult({
            idIntervention: item.idIntervention,
            drugName,
            status: "applied",
            reason: null,
          }),
        );
        dispatch(updateInterventionStatusThunk(item.idIntervention, outcome));
        dispatch(
          updateInterventionListStatusThunk(item.idIntervention, outcome),
        );
        dispatch(nextReviewItem());
      }
    });
  };

  const skipStep = () => {
    dispatch(
      addResult({
        idIntervention: item.idIntervention,
        drugName,
        status: "skipped",
        reason: "user",
      }),
    );
    dispatch(nextReviewItem());
  };

  const cancelRemaining = () => {
    reviewQueue.slice(reviewIndex).forEach((queueItem) => {
      dispatch(
        addResult({
          idIntervention: queueItem.idIntervention,
          drugName: queueItem.outcomeData.header?.originDrug,
          status: "skipped",
          reason: "canceled",
        }),
      );
    });
    dispatch(setStage("finished"));
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={confirmStep}
      initialValues={buildOutcomeInitialValues(outcomeData, outcome)}
      validationSchema={validationSchema}
    >
      {({ handleSubmit }) => (
        <>
          <Heading $size="16px" $margin="0 0 15px">
            {t("multipleIntervention.review", {
              current: reviewIndex + 1,
              total: reviewQueue.length,
            })}
            {drugName ? `: ${drugName}` : ""}
          </Heading>

          <Form onSubmit={handleSubmit} className="highlight-labels">
            <InterventionOutcomeForm
              outcomeData={outcomeData}
              loadStatus="succeeded"
            />
          </Form>

          <ModalFooter>
            <Button onClick={cancelRemaining} disabled={saving}>
              {t("multipleIntervention.cancelRemaining")}
            </Button>
            <Button onClick={skipStep} disabled={saving}>
              {t("multipleIntervention.skip")}
            </Button>
            <Button
              type="primary"
              onClick={() => handleSubmit()}
              loading={saving}
            >
              {t("multipleIntervention.confirmNext")}
            </Button>
          </ModalFooter>
        </>
      )}
    </Formik>
  );
}
