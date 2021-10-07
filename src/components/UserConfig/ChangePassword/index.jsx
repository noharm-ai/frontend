import React, { useEffect } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import { Col, Row } from '@components/Grid';
import { Box, ButtonContainer } from '@components/Forms/Form.style';
import Button from '@components/Button';
import Icon from '@components/Icon';
import Card from '@components/Card';
import notification from '@components/notification';
import { passwordValidation } from '@utils';

import { FormContainer } from '../../Forms/Form.style';
import Base from './Base';

const requiredFieldMessage = 'Campo obrigatório';
const validationSchema = Yup.object().shape({
  password: Yup.string().required(requiredFieldMessage),
  newpassword: Yup.string()
    .required(requiredFieldMessage)
    .matches(passwordValidation.regex, passwordValidation.message),
  confirmPassword: Yup.string()
    .required(requiredFieldMessage)
    .oneOf([Yup.ref('newpassword'), null], 'Senhas não conferem')
});

export default function ChangePassword({ updatePassword, status }) {
  const { t } = useTranslation();
  const { isSaving, success, error } = status;
  const initialValues = {
    password: '',
    newpassword: '',
    confirmPassword: ''
  };

  useEffect(() => {
    if (success) {
      notification.success({ message: 'Uhu! Senha alterada com sucesso! :)' });
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      notification.error({
        message: t('error.title'),
        description: error.message || t('error.description')
      });
    }
  }, [error, t]);

  const save = values => {
    updatePassword(values);
  };

  return (
    <Box flexDirection="row">
      <Col xl={12} xxl={7} style={{ alignSelf: 'flex-start' }}>
        <Card title="Alterar senha">
          <Formik
            enableReinitialize
            onSubmit={save}
            initialValues={initialValues}
            validationSchema={validationSchema}
          >
            {({ handleSubmit }) => (
              <form onSubmit={handleSubmit}>
                <FormContainer>
                  <Row type="flex" gutter={[16, 24]}>
                    <Base success={success} />
                  </Row>
                  <ButtonContainer style={{ paddingTop: '10px' }}>
                    <Button
                      type="primary gtm-btn-save-password"
                      onClick={handleSubmit}
                      loading={isSaving}
                      disabled={isSaving}
                    >
                      Salvar <Icon type="check" />
                    </Button>
                  </ButtonContainer>
                </FormContainer>
              </form>
            )}
          </Formik>
        </Card>
      </Col>
    </Box>
  );
}
