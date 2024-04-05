import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as Yup from "yup";
import { Spin } from "antd";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import {
  fetchInterventionOutcomeData,
  setInterventionOutcome,
  setSelectedIntervention,
  reset,
} from "./InterventionOutcomeSlice";
import { updateInterventionStatusThunk } from "store/ducks/prescriptions/thunk";
import { updateInterventionListStatusThunk } from "store/ducks/intervention/thunk";
import InterventionOutcomeForm from "./Form/InterventionOutcomeForm";
import { getErrorMessage } from "utils/errorHandler";

import { Form } from "styles/Form.style";

export default function InterventionOutcome({ ...props }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selectedIntervention = useSelector(
    (state) => state.interventionOutcome.selectedIntervention
  );
  const outcomeData = useSelector((state) => state.interventionOutcome.data);

  const loadStatus = useSelector((state) => state.interventionOutcome.status);
  const saveStatus = useSelector(
    (state) => state.interventionOutcome.save.status
  );

  const isLoading = saveStatus === "loading" || loadStatus === "loading";

  useEffect(() => {
    if (selectedIntervention.open) {
      dispatch(
        fetchInterventionOutcomeData({
          idIntervention: selectedIntervention.idIntervention,
        })
      );
    } else {
      dispatch(reset());
    }
  }, [
    dispatch,
    selectedIntervention.open,
    selectedIntervention.idIntervention,
  ]);

  const initialValues = {
    idIntervention: outcomeData.idIntervention,
    outcome: selectedIntervention.outcome,
    origin: outcomeData.origin?.item || {},
    idPrescriptionDrugDestiny:
      outcomeData.destiny?.length > 0
        ? outcomeData.destiny[0].item.idPrescriptionDrug
        : null,
    destiny: outcomeData.destiny?.length > 0 ? outcomeData.destiny[0].item : {},
    economyDayValueManual: outcomeData.header?.economyDayValueManual,
    economyDayValue: outcomeData.header?.economyDayValue,
    economyDayAmountManual: outcomeData.header?.economyDayAmountManual,
    economyDayAmount: outcomeData.header?.economyDayAmount,
  };

  const validationSchema = Yup.object().shape({
    idIntervention: Yup.number()
      .nullable()
      .required(t("validation.requiredField")),
    outcome: Yup.string().nullable().required(t("validation.requiredField")),
  });

  const onSave = (params) => {
    dispatch(setInterventionOutcome(params)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        onCancel();

        dispatch(
          updateInterventionStatusThunk(
            selectedIntervention.idIntervention,
            selectedIntervention.outcome
          )
        );

        dispatch(
          updateInterventionListStatusThunk(
            selectedIntervention.idIntervention,
            selectedIntervention.outcome
          )
        );

        notification.success({
          message: "Desfecho aplicado com sucesso!",
        });
      }
    });
  };

  const onCancel = () => {
    dispatch(
      setSelectedIntervention({
        open: false,
        idIntervention: null,
        outcome: null,
      })
    );
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={onSave}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit }) => (
        <DefaultModal
          open={selectedIntervention.open}
          width={
            outcomeData.header?.economyType == null
              ? 400
              : outcomeData.header?.economyType === 2
              ? 800
              : 600
          }
          centered
          destroyOnClose
          onCancel={onCancel}
          onOk={handleSubmit}
          okText={
            selectedIntervention.outcome === "s" ? "Desfazer" : "Confirmar"
          }
          cancelText={t("actions.cancel")}
          confirmLoading={isLoading}
          okButtonProps={{
            disabled: isLoading,
            danger: selectedIntervention.outcome === "s",
            type: selectedIntervention.outcome === "s" ? "default" : "primary",
          }}
          cancelButtonProps={{
            disabled: isLoading,
          }}
          {...props}
        >
          <header>
            <Heading margin="0 0 11px" size="18px">
              {t(`interventionStatusAction.${selectedIntervention.outcome}`)}
            </Heading>
          </header>

          <Spin spinning={loadStatus === "loading"}>
            <Form onSubmit={handleSubmit} className="highlight-labels">
              <InterventionOutcomeForm />
            </Form>
          </Spin>
        </DefaultModal>
      )}
    </Formik>
  );
}
