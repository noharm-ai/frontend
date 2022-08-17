import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { useTranslation } from "react-i18next";

import Alert from "components/Alert";
import { Row } from "components/Grid";
import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";

import Base from "./Base";
import { FormContainer } from "./Patient.style";

const saveMessage = {
  message: "Uhu! Dados do paciente salvo com sucesso! :)",
};
const validationSchema = Yup.object().shape({
  weight: Yup.number().nullable(),
  height: Yup.number().nullable(),
});

export default function Patient({
  saveStatus,
  savePatient,
  afterSavePatient,
  idPrescription,
  admissionNumber,
  weight,
  height,
  birthdate,
  skinColor,
  gender,
  observation,
  dialysis,
  clinicalNotes,
  notesInfo,
  notesInfoDate,
  security,
  featureService,
  ...props
}) {
  const { t } = useTranslation();
  const { isSaving } = saveStatus;
  const hasNoHarmCare = security.hasNoHarmCare();

  const initialValues = {
    idPrescription,
    admissionNumber,
    weight,
    height,
    observation,
    dialysis,
    birthdate,
    skinColor,
    gender,
  };

  const submit = (params) => {
    savePatient(params)
      .then(() => {
        notification.success(saveMessage);
        afterSavePatient();
      })
      .catch((err) => {
        console.error("error", err);
        notification.error({
          message: t("error.title"),
          description: t("error.description"),
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
          centered
          destroyOnClose
          {...props}
          onOk={handleSubmit}
          confirmLoading={isSaving}
          cancelButtonProps={{
            disabled: isSaving,
            className: "gtm-bt-cancel-edit-patient",
          }}
        >
          <header>
            <Heading margin="0 0 11px">Dados do paciente</Heading>
          </header>
          {hasNoHarmCare && notesInfo && (
            <Alert
              message={`NoHarm Care (${moment(notesInfoDate).format(
                "DD/MM/YYYY hh:mm"
              )})`}
              description={notesInfo}
              type="info"
              showIcon
            />
          )}
          <form onSubmit={handleSubmit}>
            <FormContainer>
              <Row type="flex" gutter={[16, 24]}>
                <Base featureService={featureService} />
              </Row>
            </FormContainer>
          </form>
        </DefaultModal>
      )}
    </Formik>
  );
}

Patient.defaultProps = {
  afterSavePatient: () => {},
  initialValues: {
    weight: "",
    height: "",
  },
};
