import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";
import { setUser, upsertUser } from "../UserAdminSlice";
import Base from "./Base";

import { Form } from "styles/Form.style";

export default function UserAdminForm({ ...props }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.userAdmin.single.data);
  const status = useSelector((state) => state.userAdmin.single.status);
  const isSaving = status === "loading";

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t("validation.requiredField")),
    email: Yup.string()
      .email(t("userAdminForm.emailError"))
      .required(t("validation.requiredField")),
  });
  const initialValues = {
    ...formData,
  };

  const onSave = (params) => {
    const payload = { ...params };

    dispatch(upsertUser(payload)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        dispatch(setUser(null));

        notification.success({
          message: t("success.generic"),
        });
      }
    });
  };

  const onCancel = () => {
    dispatch(setUser(null));
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
          width={550}
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
            <Heading margin="0 0 11px">{t("menu.userConfig")}</Heading>
          </header>

          <Form onSubmit={handleSubmit}>
            <Base />
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
