import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as Yup from "yup";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import {
  fetchInterventionOutcomeData,
  setSelectedIntervention,
} from "./InterventionOutcomeSlice";

import { Form } from "styles/Form.style";

export default function InterventionOutcome({ ...props }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selectedIntervention = useSelector(
    (state) => state.interventionOutcome.selectedIntervention
  );

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
    }
  }, [
    dispatch,
    selectedIntervention.open,
    selectedIntervention.idIntervention,
  ]);

  const initialValues = {};

  const validationSchema = Yup.object().shape({
    id: Yup.number().nullable().required(t("validation.requiredField")),
  });

  const onSave = () => {
    console.log("save");
    notification.success({ message: "OK" });
  };

  const onCancel = () => {
    setSelectedIntervention({
      open: false,
      idIntervention: null,
      outcome: null,
    });
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
          width={500}
          centered
          destroyOnClose
          onCancel={onCancel}
          onOk={handleSubmit}
          okText={t("actions.save")}
          cancelText={t("actions.cancel")}
          confirmLoading={isLoading}
          okButtonProps={{
            disabled: isLoading,
          }}
          cancelButtonProps={{
            disabled: isLoading,
          }}
          {...props}
        >
          <header>
            <Heading margin="0 0 11px" size="18px">
              Registrar Desfecho
            </Heading>
          </header>

          <Form onSubmit={handleSubmit}></Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
