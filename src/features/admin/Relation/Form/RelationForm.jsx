import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";
import { Form } from "styles/Form.style";
import { setRelation, upsertRelation } from "../RelationsSlice";
import Base from "./Base";

export default function RelationForm({ ...props }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.admin.relation.single.data);
  const status = useSelector((state) => state.admin.relation.single.status);
  const isSaving = status === "loading";

  const validationSchema = Yup.object().shape({
    sctida: Yup.string().nullable().required(t("validation.requiredField")),
    sctidb: Yup.string().nullable().required(t("validation.requiredField")),
    kind: Yup.string().nullable().required(t("validation.requiredField")),
    level: Yup.string().nullable().required(t("validation.requiredField")),
  });
  const initialValues = {
    ...formData,
  };

  const onSave = (params) => {
    dispatch(upsertRelation(params)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        dispatch(setRelation(null));

        notification.success({
          message: t("success.generic"),
        });
      }
    });
  };

  const onCancel = () => {
    dispatch(setRelation(null));
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
          open={formData}
          width={600}
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
            <Heading margin="0 0 11px">Relação</Heading>
          </header>

          <Form onSubmit={handleSubmit}>
            <Base open={formData} />
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
