import React, { useEffect, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { Col, Row } from '@components/Grid';
import { Box, ButtonContainer } from '@components/Forms/Form.style';
import Button from '@components/Button';
import Icon from '@components/Icon';
import Card from '@components/Card';
import notification from '@components/notification';

import { FormContainer } from '../../Forms/Form.style';
import Base from './Base';

const saveMessage = {
  message: 'Uhu! Senha alterada com sucesso! :)'
};
const requiredFieldMessage = 'Campo obrigatório';
const validationSchema = Yup.object().shape({
  currentPassword: Yup.string().required(requiredFieldMessage),
  newPassword: Yup.string().required(requiredFieldMessage),
  confirmPassword: Yup.string()
    .required(requiredFieldMessage)
    .oneOf([Yup.ref('newPassword'), null], 'Senhas não conferem')
});

export default function ChangePassword() {
  const initialValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  const save = () => {
    console.log('saving');
  };

  // useEffect(() => {
  //   if (success) {
  //     notification.success({ message: 'Uhu! Assinatura salva com sucesso! :)' });
  //   }
  // }, [success]);

  // useEffect(() => {
  //   if (error) {
  //     notification.error({
  //       message: 'Ops! Algo de errado aconteceu.',
  //       description:
  //         'Aconteceu algo que nos impediu de salvar os dados desta assinatura. Por favor, tente novamente.'
  //     });
  //   }
  // }, [error]);

  return (
    <Box flexDirection="row">
      <Col xs={7} style={{ alignSelf: 'flex-start' }}>
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
                    <Base />
                  </Row>
                  <ButtonContainer style={{ paddingTop: '10px' }}>
                    <Button type="primary" onClick={handleSubmit}>
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
