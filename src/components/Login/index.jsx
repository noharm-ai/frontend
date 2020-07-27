import 'styled-components/macro';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import appInfo from '@utils/appInfo';
import { isEmpty } from '@utils/lodash';
import { setErrorClassName } from '@utils/form';
import message from '@components/message';
import Icon from '@components/Icon';
import Button from '@components/Button';
import { Input, Checkbox } from '@components/Inputs';
import { Container, Row, Col } from '@components/Grid';
import { Wrapper, Box, Brand, FieldSet, ForgotPass } from './Login.style';
import { useTranslation } from "react-i18next";

const initialValues = {
  email: '',
  password: '',
  keepMeLogged: false
};
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Ops! Formato de email inválido.')
    .required('Você se esqueceu de inserir o seu email.'),
  password: Yup.string().required('Você se esquecei de inserir a sua senha.')
});

export default function Login({ isLogging, error, doLogin }) {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: values => doLogin(values)
  });

  const {t, i18n} = useTranslation();

  useEffect(() => {
    if (!isEmpty(error)) {
      message.error(error.message);
    }
  }, [error]);

  return (
    <Wrapper as="form" onSubmit={handleSubmit}>
      <Container>
        <Row type="flex" justify="center">
          <Col span={24} md={8}>
            <Box>
              <Brand title="noHarm.ai | Cuidando dos pacientes" />

              <FieldSet
                className={setErrorClassName((errors.email && touched.email) || !isEmpty(error))}
              >
                <Input
                  placeholder={t('login.email')}
                  prefix={<Icon type="user" />}
                  name="email"
                  type="email"
                  value={values.email}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
              </FieldSet>

              <FieldSet
                className={setErrorClassName(
                  (errors.password && touched.password) || !isEmpty(error)
                )}
              >
                <Input.Password
                  placeholder={t('login.password')}
                  prefix={<Icon type="lock" />}
                  name="password"
                  value={values.password}
                  onBlur={handleBlur}
                  onChange={handleChange}
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
                      {t('login.keepMeLogged')}
                    </Checkbox>
                  </FieldSet>
                </Col>
                <Col span={12} css="text-align: right">
                  <ForgotPass href="#" className="gtm-lnk-forgotpass">{t('login.forgotPass')}</ForgotPass>
                </Col>
              </Row>

              <Button type="primary gtm-btn-login" htmlType="submit" block loading={isLogging}>
                {t('login.login')}
              </Button>

              <div>
                  <h1>{t('login.chooseLanguage')}</h1>
                  <button onClick={() => i18n.changeLanguage('pt')}>Português</button>
                  <button onClick={() => i18n.changeLanguage('en')}>English</button>
              </div>
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
  doLogin: PropTypes.func.isRequired
};

Login.defaultProps = {
  error: {}
};
