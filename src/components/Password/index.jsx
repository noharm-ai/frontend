import 'styled-components/macro';
import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { setErrorClassName } from '@utils/form';

import notification from '@components/notification';
import Icon from '@components/Icon';
import Button from '@components/Button';
import { Input } from '@components/Inputs';
import { Container, Row, Col } from '@components/Grid';
import { Wrapper, Box, Brand, FieldSet, ForgotPass } from '../Login/Login.style';

const validationSchema = Yup.object().shape({
  newpassword: Yup.string().required('Campo obrigatório'),
  confirmPassword: Yup.string()
    .required('Campo obrigatório')
    .oneOf([Yup.ref('newpassword'), null], 'Senhas não conferem')
});

export default function Password({ resetPassword, match, status }) {
  const [passwordChanged, setPasswordChanged] = useState(false);
  const { isSaving, success, error } = status;
  const initialValues = {
    token: match.params.token,
    newpassword: '',
    confirmPassword: ''
  };

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: values => resetPassword(values.token, values.newpassword)
  });

  useEffect(() => {
    if (success) {
      notification.success({ message: 'Uhu! Senha alterada com sucesso! :)' });
      setPasswordChanged(true);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      notification.error({
        message: 'Ops! Algo de errado aconteceu.',
        description:
          error.message ||
          'Aconteceu algo que nos impediu de salvar os dados. Por favor, tente novamente.'
      });
    }
  }, [error]);

  return (
    <Wrapper as="form">
      <Container>
        <Row type="flex" justify="center">
          <Col span={24} md={8}>
            <Box>
              <Brand title="noHarm.ai | Cuidando dos pacientes" />

              {!passwordChanged && (
                <>
                  <FieldSet
                    className={setErrorClassName(errors.newpassword && touched.newpassword)}
                  >
                    <Input.Password
                      placeholder="Nova senha"
                      prefix={<Icon type="lock" />}
                      name="newpassword"
                      type="newpassword"
                      value={values.newpassword}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    />
                  </FieldSet>

                  <FieldSet
                    className={setErrorClassName(errors.confirmPassword && touched.confirmPassword)}
                  >
                    <Input.Password
                      placeholder="Confirme a senha"
                      prefix={<Icon type="lock" />}
                      name="confirmPassword"
                      value={values.confirmPassword}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    />
                  </FieldSet>

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
                  <Col span={24} css="text-align: center">
                    A sua senha foi alterada com sucesso.
                  </Col>
                  <Col span={24} css="text-align: center; margin-top: 15px">
                    <ForgotPass href="/login" className="gtm-lnk-backtologin">
                      Login
                    </ForgotPass>
                  </Col>
                </>
              )}
            </Box>
          </Col>
        </Row>
      </Container>
    </Wrapper>
  );
}
