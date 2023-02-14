import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";

import { Form } from "styles/Form.style";

import {
  selectInterventionReason,
  setInterventionReason,
  upsertInterventionReason,
} from "../InterventionReasonSlice";
import Base from "./Base";

function InterventionReasonForm({ ...props }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const formData = useSelector(selectInterventionReason);
  const status = useSelector(
    (state) => state.admin.interventionReason.single.status
  );
  const isSaving = status === "loading";

  const validationSchema = Yup.object().shape({
    name: Yup.string().nullable().required(t("validation.requiredField")),
  });
  const initialValues = { ...formData };

  const onSave = (params) => {
    console.log("save", params);
    dispatch(upsertInterventionReason(params))
      .then(() => {
        dispatch(setInterventionReason(null));

        notification.success({
          message: t("success.generic"),
        });
      })
      .catch((error) => {
        console.error(error);
        notification.error({
          message: t("error.title"),
          description: t("error.description"),
        });
      });
  };

  const onCancel = () => {
    dispatch(setInterventionReason(null));
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
          visible={formData}
          width={700}
          centered
          destroyOnClose
          onCancel={onCancel}
          onOk={handleSubmit}
          okText={t("actions.save")}
          cancelText={t("actions.cancel")}
          confirmLoading={isSaving}
          okButtonProps={{
            disabled: isSaving,
          }}
          cancelButtonProps={{
            disabled: isSaving,
          }}
          {...props}
        >
          <header>
            <Heading margin="0 0 11px">{t("labels.reason")}</Heading>
          </header>

          <Form onSubmit={handleSubmit}>
            <Base />
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}

export default InterventionReasonForm;
