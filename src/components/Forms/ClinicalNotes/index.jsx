import React, { useEffect } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import { Row } from "components/Grid";
import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { SIGNATURE_STORE_ID, SIGNATURE_MEMORY_TYPE } from "utils/memory";

import Base from "./Base";
import { FormContainer } from "../Form.style";

const validationSchema = Yup.object().shape({
  idPrescription: Yup.number().required(),
  notes: Yup.string().nullable().required("Campo obrigatório"),
  hasConciliation: Yup.boolean(),
  concilia: Yup.string()
    .nullable()
    .when("hasConciliation", {
      is: true,
      then: Yup.string().required("Campo obrigatório"),
    }),
  date: Yup.string()
    .nullable()
    .when("action", {
      is: "schedule",
      then: Yup.string().nullable().required("Campo obrigatório"),
    }),
});
const formId = "clinicalNotes";

export default function ClinicalNotes({
  prescription,
  save,
  afterSave,
  account,
  signature,
  action,
  fetchMemory,
  open,
  type,
  ...props
}) {
  const { t } = useTranslation();
  const { isSaving, data } = prescription;
  const initialValues = {
    formId,
    idPrescription: data.idPrescription,
    admissionNumber: data.admissionNumber,
    notes: data.notes ? data.notes : "",
    concilia: data.concilia && data.concilia === "s" ? "" : data.concilia,
    hasConciliation: !!data.concilia,
    action,
    date: null,
    open: type === "primarycare" ? open : false, //reinitialize formik if primarycare
  };

  useEffect(() => {
    if (open) {
      fetchMemory(
        SIGNATURE_STORE_ID,
        `${SIGNATURE_MEMORY_TYPE}_${account.userId}`
      );
    }
  }, [account.userId, fetchMemory, open]);

  const submit = (formData) => {
    const params = { ...formData };

    if (params.hasConciliation) {
      delete params.hasConciliation;
    } else {
      delete params.hasConciliation;
      delete params.concilia;
    }

    save(params)
      .then(() => {
        const message =
          params.action === "schedule"
            ? "Uhu! Agendamento salvo com sucesso! :)"
            : "Uhu! Evolução salva com sucesso! :)";
        notification.success({
          message,
        });
        if (afterSave) {
          afterSave();
        }
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
          width={"50vw"}
          centered
          destroyOnClose
          open={open}
          {...props}
          onOk={handleSubmit}
          confirmLoading={isSaving}
          okButtonProps={{
            disabled: isSaving,
            className: "gtm-bt-save-clinical-notes",
          }}
          cancelButtonProps={{
            disabled: isSaving,
            className: "gtm-bt-cancel-clinical-notes",
          }}
        >
          <header>
            <Heading margin="0 0 11px">
              {action === "schedule" ? "Agendar consulta" : "Evolução"}
            </Heading>
          </header>
          <form onSubmit={handleSubmit}>
            <FormContainer>
              <Row type="flex" gutter={[16, 24]}>
                <Base
                  prescription={prescription}
                  account={account}
                  signature={signature}
                  action={action}
                />
              </Row>
            </FormContainer>
          </form>
        </DefaultModal>
      )}
    </Formik>
  );
}
