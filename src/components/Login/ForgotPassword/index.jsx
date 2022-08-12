import "styled-components/macro";
import React, { useEffect } from "react";
import { UserOutlined } from "@ant-design/icons";
import { useFormik } from "formik";
import * as Yup from "yup";

import notification from "components/notification";
import Button from "components/Button";
import { Input } from "components/Inputs";

import { useTranslation } from "react-i18next";
import { FieldSet } from "../Login.style";

const initialValues = {
  email: "",
};
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Ops! Formato de email inválido.")
    .required("Você se esqueceu de inserir o seu email."),
});

export default function ForgotPassword({ forgotPassword, status }) {
  const { isSaving, success, error } = status;
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      forgotPassword(values.email);
    },
  });

  const { t } = useTranslation();

  useEffect(() => {
    if (success) {
      notification.success({
        message: `Um e-mail foi enviado para ${values.email} com as instruções para alterar a senha`,
      });
      resetForm();
    }
  }, [resetForm, success]); //eslint-disable-line

  useEffect(() => {
    if (error) {
      notification.error({
        message: t("error.title"),
        description: error.message || t("error.description"),
      });
    }
  }, [error, t]);

  return (
    <>
      <FieldSet>
        <Input
          placeholder={t("login.email")}
          prefix={<UserOutlined />}
          name="email"
          type="email"
          value={values.email}
          onBlur={handleBlur}
          onChange={handleChange}
          status={errors.email && touched.email ? "error" : ""}
        />
      </FieldSet>

      <Button
        type="primary gtm-btn-login"
        block
        onClick={handleSubmit}
        loading={isSaving}
        disabled={isSaving}
      >
        Enviar
      </Button>
    </>
  );
}
