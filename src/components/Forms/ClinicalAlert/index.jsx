import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import { Row } from "components/Grid";
import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { getErrorMessageFromException } from "utils/errorHandler";

import Base from "./Base";
import { FormContainer } from "../Form.style";

const saveMessage = {
  message: "Uhu! Alerta salvo com sucesso! :)",
};
const requiredFieldMessage = "Campo obrigatório";
const validationSchema = Yup.object().shape({
  alert: Yup.string().nullable().required(requiredFieldMessage),
  alertExpire: Yup.string().nullable().required(requiredFieldMessage),
});
const formId = "clinicalAlert";

export default function ClinicalAlert({
  prescription,
  save,
  afterSave,
  ...props
}) {
  const { t } = useTranslation();
  const { isSaving, data } = prescription;

  const initialValues = {
    formId,
    admissionNumber: data.admissionNumber,
    alert: data.alert,
    alertExpire: data.alertExpire,
  };

  const submit = (params) => {
    save(params)
      .then(() => {
        notification.success(saveMessage);
        if (afterSave) {
          afterSave();
        }
      })
      .catch((err) => {
        console.error("err", err);
        notification.error({
          message: t("error.title"),
          description: getErrorMessageFromException(err, t),
        });
      });
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={submit}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit }) => (
        <DefaultModal
          width={700}
          centered
          destroyOnClose
          {...props}
          onOk={handleSubmit}
          confirmLoading={isSaving}
          okButtonProps={{
            disabled: isSaving,
            className: "gtm-bt-save-alert",
          }}
          cancelButtonProps={{
            disabled: isSaving,
            className: "gtm-bt-cancel-alert",
          }}
        >
          <header>
            <Heading $margin="0 0 11px">Alerta</Heading>
          </header>
          <form onSubmit={handleSubmit}>
            <FormContainer>
              <Row type="flex" gutter={[16, 24]}>
                <Base />
              </Row>
            </FormContainer>
          </form>
        </DefaultModal>
      )}
    </Formik>
  );
}
