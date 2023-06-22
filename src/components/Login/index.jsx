import "styled-components/macro";
import React, { useEffect, useState } from "react";

import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import * as Yup from "yup";

import appInfo from "utils/appInfo";
import { isEmpty } from "utils/lodash";
import message from "components/message";
import Button from "components/Button";
import { Input, Checkbox } from "components/Inputs";
import { Container, Row, Col } from "components/Grid";
import Spin from "components/Spin";
import notification from "components/notification";

import ForgotPassword from "containers/Login/ForgotPassword";
import api from "services/api";
import { Wrapper, Box, Brand, FieldSet, ForgotPass } from "./Login.style";

const initialValues = {
  email: "",
  password: "",
  keepMeLogged: true,
};
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Ops! Formato de email inválido.")
    .required("Você se esqueceu de inserir o seu email."),
  password: Yup.string().required("Você se esquecei de inserir a sua senha."),
});

export default function Login({ isLogging, error, doLogin, match }) {
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [oauthData, setOauthData] = useState(null);
  const [forgotPassTabActive, setForgotPassTab] = useState(false);
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
    useFormik({
      initialValues,
      validationSchema,
      onSubmit: (values) => doLogin(values),
    });

  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (!isEmpty(error)) {
      message.error(error.message);
    }
  }, [error]);

  useEffect(() => {
    const getAuthProvider = async (schema) => {
      try {
        const { data } = await api.getAuthProvider(schema);
        setOauthData(data.data);
        setLoading(false);
      } catch (e) {
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
    if (match && match.params.language) {
      i18n.changeLanguage(match.params.language);
      localStorage.setItem("language", match.params.language);
    } else {
      localStorage.setItem("language", "pt");
    }
  }, [match, i18n]);

  const openOauthLogin = () => {
    window.location.href = oauthData.url;
  };

  return (
    <Wrapper as="form">
      <Container>
        <Row type="flex" justify="center">
          <Col span={24} md={8}>
            <Box>
              <Brand title="noHarm.ai | Cuidando dos pacientes" />

              {params.schema ? (
                <>
                  {loading ? (
                    <div className="loader">
                      <Spin size="large" />
                    </div>
                  ) : (
                    <>
                      <div className="company-name">{oauthData?.company}</div>
                      <Button
                        type="primary gtm-btn-oauthlogin"
                        block
                        onClick={openOauthLogin}
                      >
                        {t("login.login")}
                      </Button>
                      <p className="description">
                        Você será redirecionado para a página de login da sua
                        empresa.
                      </p>
                    </>
                  )}
                </>
              ) : (
                <>
                  {!forgotPassTabActive && (
                    <>
                      <FieldSet>
                        <Input
                          placeholder={t("login.email")}
                          prefix={<UserOutlined />}
                          name="email"
                          type="email"
                          value={values.email}
                          status={
                            (errors.email && touched.email) || !isEmpty(error)
                              ? "error"
                              : ""
                          }
                          onBlur={handleBlur}
                          onChange={handleChange}
                        />
                      </FieldSet>

                      <FieldSet>
                        <Input.Password
                          placeholder={t("login.password")}
                          prefix={<LockOutlined />}
                          name="password"
                          value={values.password}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          status={
                            (errors.password && touched.password) ||
                            !isEmpty(error)
                              ? "error"
                              : ""
                          }
                        />
                      </FieldSet>

                      <Row>
                        <Col span={12}>
                          <FieldSet>
                            <Checkbox
                              name="keepMeLogged"
                              checked={values.keepMeLogged}
                              onChange={handleChange}
                            >
                              {t("login.keepMeLogged")}
                            </Checkbox>
                          </FieldSet>
                        </Col>
                        <Col span={12} css="text-align: right">
                          <ForgotPass
                            href="#"
                            className="gtm-lnk-forgotpass"
                            onClick={() => setForgotPassTab(true)}
                          >
                            {t("login.forgotPass")}
                          </ForgotPass>
                        </Col>
                      </Row>

                      <Button
                        type="primary gtm-btn-login"
                        htmlType="submit"
                        block
                        loading={isLogging}
                        onClick={handleSubmit}
                      >
                        {t("login.login")}
                      </Button>
                    </>
                  )}
                  {forgotPassTabActive && (
                    <>
                      <ForgotPassword />
                      <Row>
                        <Col
                          span={24}
                          css="text-align: center; margin-top: 15px"
                        >
                          <ForgotPass
                            href="#"
                            className="gtm-lnk-backtologin"
                            onClick={() => setForgotPassTab(false)}
                          >
                            Voltar
                          </ForgotPass>
                        </Col>
                      </Row>
                    </>
                  )}
                </>
              )}
            </Box>
          </Col>
        </Row>
      </Container>

      <p className="copyright">{appInfo.copyright}</p>
    </Wrapper>
  );
}

Login.propTypes = {
  error: PropTypes.shape(),
  doLogin: PropTypes.func.isRequired,
};

Login.defaultProps = {
  error: {},
};
