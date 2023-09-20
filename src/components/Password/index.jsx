import "styled-components/macro";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { LockOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";

import notification from "components/notification";
import Button from "components/Button";
import { Input } from "components/Inputs";
import appInfo from "utils/appInfo";
import { passwordValidation } from "utils";
import { Brand, LoginContainer, FieldError } from "../Login/Login.style";

const validationSchema = Yup.object().shape({
  newpassword: Yup.string()
    .required("Campo obrigatório")
    .matches(passwordValidation.regex, passwordValidation.message),
  confirmPassword: Yup.string()
    .required("Campo obrigatório")
    .oneOf([Yup.ref("newpassword"), null], "Senhas não conferem"),
});

export default function Password({ resetPassword, status }) {
  const params = useParams();
  const { t } = useTranslation();
  const [passwordChanged, setPasswordChanged] = useState(false);
  const { isSaving, error } = status;
  const initialValues = {
    token: params.token,
    newpassword: "",
    confirmPassword: "",
  };

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
    useFormik({
      initialValues,
      validationSchema,
      onSubmit: (values) => {
        resetPassword(values.token, values.newpassword)
          .then(() => {
            notification.success({
              message: "Uhu! Senha alterada com sucesso! :)",
            });
            setPasswordChanged(true);
          })
          .catch((err) => {
            console.error(err);
            notification.error({
              message: t("error.title"),
              description: error?.message || t("error.description"),
            });
          });
      },
    });

  return (
    <LoginContainer>
      <div className="form">
        <Brand title="noHarm.ai | Cuidando dos pacientes" />

        <div className="form-container">
          {!passwordChanged && (
            <>
              <Input.Password
                placeholder="Nova senha"
                prefix={<LockOutlined />}
                name="newpassword"
                type="newpassword"
                value={values.newpassword}
                onBlur={handleBlur}
                onChange={handleChange}
                className="input-password"
                status={
                  errors.newpassword && touched.newpassword ? "error" : ""
                }
              />
              <FieldError>{errors.newpassword}</FieldError>

              <Input.Password
                placeholder="Confirme a senha"
                prefix={<LockOutlined />}
                name="confirmPassword"
                value={values.confirmPassword}
                onBlur={handleBlur}
                onChange={handleChange}
                className="input-password"
                status={
                  errors.confirmPassword && touched.confirmPassword
                    ? "error"
                    : ""
                }
              />
              <FieldError>{errors.confirmPassword}</FieldError>

              <Button
                type="primary gtm-btn-login"
                htmlType="submit"
                block
                onClick={handleSubmit}
                loading={isSaving}
                disabled={isSaving}
              >
                Alterar senha
              </Button>
            </>
          )}
          {passwordChanged && (
            <>
              <div className="company-name">
                A sua senha foi alterada com sucesso.
              </div>
              <Button
                type="link"
                block
                size="large"
                href="/login"
                className="gtm-lnk-backtologin"
              >
                Login
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="bg">
        <div className="gradient"></div>
      </div>
      <p className="copyright">{appInfo.copyright}</p>
    </LoginContainer>
  );
}
