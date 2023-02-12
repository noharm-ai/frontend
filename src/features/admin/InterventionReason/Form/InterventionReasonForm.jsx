import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";

import Base from "./Base";

function InterventionReasonForm({ visible, ...props }) {
  const { t } = useTranslation();

  const validationSchema = Yup.object().shape({
    idInterventionReason: Yup.array()
      .nullable()
      .required(t("validation.requiredField")),
  });
  const initialValues = {};

  const onSave = (params) => {
    console.log("save", params);
  };

  const onCancel = () => {
    console.log("on cancel");
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
          visible={visible}
          width={700}
          centered
          destroyOnClose
          onCancel={onCancel}
          {...props}
        >
          <header>
            <Heading margin="0 0 11px">{t("interventionForm.title")}</Heading>
          </header>

          <form onSubmit={handleSubmit}>
            <Base />
          </form>
        </DefaultModal>
      )}
    </Formik>
  );
}

export default InterventionReasonForm;
