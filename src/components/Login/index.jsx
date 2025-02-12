import "styled-components";
import React, { useEffect, useState } from "react";

import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useFormik } from "formik";
import * as Yup from "yup";

import appInfo from "utils/appInfo";
import { isEmpty } from "utils/lodash";
import message from "components/message";
import Button from "components/Button";
import { Input, Checkbox } from "components/Inputs";
import Spin from "components/Spin";
import notification from "components/notification";
import { generateRandomString, getCodeChallenge } from "utils/auth";

import ForgotPassword from "containers/Login/ForgotPassword";
import ChooseSchema from "./ChooseSchema";
import api from "services/api";
import { LoginContainer, Brand, BrandEN } from "./Login.style";

const initialValues = {
  email: "",
  password: "",
  keepMeLogged: true,
};
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Ops! Formato de email inválido.")
    .required("Você esqueceu de inserir o seu email."),
  password: Yup.string().required("Você esqueceu de inserir a sua senha."),
});

export default function Login({ isLogging, error, doLogin }) {
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [oauthData, setOauthData] = useState(null);
  const [forgotPassTabActive, setForgotPassTab] = useState(false);
  const [preAuthError, setPreAuthError] = useState(false);
  const [preAuthLoading, setPreAuthLoading] = useState(false);
  const [preAuthModal, setPreAuthModal] = useState(null);
  const [preAuthConfig, setpreAuthConfig] = useState(null);
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
    useFormik({
      initialValues,
      validationSchema,
      onSubmit: (values) => preLogin(values),
    });

  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (!isEmpty(error)) {
      if (error.code && error.code.indexOf("http") !== -1) {
        message.info("Redirecionando");
        window.location.href = error.code;
      }

      message.error(error.message);
    }
  }, [error]);

  useEffect(() => {
    const getAuthProvider = async (schema) => {
      try {
        const { data } = await api.getAuthProvider(schema);
        const config = { ...data.data };

        if (config.flow === "pkce") {
          const verifier = generateRandomString();
          localStorage.setItem("oauth_verifier", verifier);
          const codeChallenge = await getCodeChallenge(verifier);

          config.url = `${config.url}&code_challenge=${codeChallenge}&code_challenge_method=${config.codeChallengeMethod}`;
        }

        setOauthData(config);
        setLoading(false);
      } catch {
        notification.error({
          message: "Inválido ou inexistente",
        });
      }
    };

    if (params.schema) {
      setLoading(true);
      getAuthProvider(params.schema);
    }
  }, [params.schema]);

  useEffect(() => {
    const queryString = new URLSearchParams(window.location.search);

    const language = queryString.get("language");

    if (language) {
      i18n.changeLanguage(language);
      localStorage.setItem("language", language);
    } else {
      localStorage.setItem("language", "pt");
    }
  }, []); //eslint-disable-line

  const preLogin = async (params) => {
    setPreAuthError(false);
    setPreAuthLoading(true);

    try {
      const { data } = await api.preAuth(params);
      setPreAuthLoading(false);

      if (data.schemas.length) {
        setpreAuthConfig({
          schemas: data.schemas,
          params,
          maintainer: data.maintainer,
        });
        setPreAuthModal(true);
      } else {
        doLogin(params);
      }
    } catch (e) {
      setPreAuthError(true);
      setPreAuthLoading(false);
      message.error(e.response?.data?.message);
    }
  };

  const openOauthLogin = () => {
    window.location.href = oauthData.url;
  };

  return (
    <LoginContainer>
      <div className="form">
        {localStorage.getItem("language") === "en" ? (
          <BrandEN title="NoHarm.ai | Taking care of patients" />
        ) : (
          <Brand title="NoHarm.ai | Cuidando dos pacientes" />
        )}

        {params.schema ? (
          <div className="form-container">
            {loading ? (
              <div className="loader">
                <Spin size="large" />
              </div>
            ) : (
              <>
                <div className="company-name">{oauthData?.company}</div>
                <Button
                  type="primary"
                  className="gtm-btn-oauthlogin"
                  block
                  onClick={openOauthLogin}
                >
                  {t("login.login")}
                </Button>
                <p className="description">
                  Você será redirecionado para a página de login da sua empresa.
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            {!forgotPassTabActive && (
              <form className="form-container">
                <Input
                  placeholder={t("login.email")}
                  prefix={<UserOutlined />}
                  name="email"
                  type="email"
                  value={values.email}
                  status={
                    (errors.email && touched.email) ||
                    !isEmpty(error) ||
                    preAuthError
                      ? "error"
                      : ""
                  }
                  onBlur={handleBlur}
                  onChange={handleChange}
                  size="large"
                  className="input"
                />

                <Input.Password
                  placeholder={t("login.password")}
                  prefix={<LockOutlined />}
                  name="password"
                  value={values.password}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  status={
                    (errors.password && touched.password) ||
                    !isEmpty(error) ||
                    preAuthError
                      ? "error"
                      : ""
                  }
                  size="large"
                  className="input"
                />

                <div className="checkbox">
                  <Checkbox
                    name="keepMeLogged"
                    checked={values.keepMeLogged}
                    onChange={handleChange}
                  >
                    {t("login.keepMeLogged")}
                  </Checkbox>
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={isLogging || preAuthLoading}
                  onClick={handleSubmit}
                  size="large"
                  className="gtm-btn-login"
                >
                  {t("login.login")}
                </Button>

                <Button
                  type="text"
                  block
                  className="gtm-lnk-forgotpass small"
                  size="large"
                  onClick={() => setForgotPassTab(true)}
                >
                  {t("login.forgotPass")}
                </Button>
              </form>
            )}
            {forgotPassTabActive && (
              <div className="form-container">
                <ForgotPassword />

                <Button
                  type="text"
                  block
                  className="gtm-lnk-backtologin small"
                  onClick={() => setForgotPassTab(false)}
                >
                  {t("actions.back")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="bg">
        <div className="gradient"></div>
      </div>
      <p className="copyright">{appInfo.copyright}</p>
      <ChooseSchema
        preAuthConfig={preAuthConfig}
        doLogin={doLogin}
        open={preAuthModal}
        setOpen={setPreAuthModal}
        isLogging={isLogging}
      />
    </LoginContainer>
  );
}
