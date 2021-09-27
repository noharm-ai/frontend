import React, { useEffect } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { Row } from '@components/Grid';
import notification from '@components/notification';
import Heading from '@components/Heading';
import DefaultModal from '@components/Modal';

import Base from './Base';
import { FormContainer } from '../Form.style';

const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description:
    'Aconteceu algo que nos impediu de salvar os dados deste usuário. Por favor, tente novamente.'
};

const saveMessage = {
  message: 'Uhu! Usuário salvo com sucesso! :)'
};
const validationSchema = Yup.object().shape({
  name: Yup.string().required(),
  email: Yup.string().required()
});

export default function User({ saveStatus, save, afterSaveUser, user, ...props }) {
  const { isSaving, success, error } = saveStatus;
  const { ...data } = user.content;

  const initialValues = {
    ...data
  };

  useEffect(() => {
    if (success) {
      notification.success(saveMessage);
      if (afterSaveUser) {
        afterSaveUser();
      }
    }

    if (error) {
      notification.error(errorMessage);
    }
  }, [success, error, afterSaveUser]);

  return (
    <Formik
      enableReinitialize
      onSubmit={save}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit }) => (
        <DefaultModal
          width={700}
          centered
          destroyOnClose
          {...props}
          onOk={handleSubmit}
          confirmLoading={isSaving}
          okButtonProps={{
            disabled: isSaving
          }}
          cancelButtonProps={{
            disabled: isSaving,
            className: 'gtm-bt-cancel-edit-exam'
          }}
        >
          <header>
            <Heading margin="0 0 11px">Exame</Heading>
          </header>
          <form onSubmit={handleSubmit}>
            <FormContainer>
              <Row type="flex" gutter={[16, 24]}>
                <Base />
              </Row>
            </FormContainer>
          </form>
        </DefaultModal>
      )}
    </Formik>
  );
}

User.defaultProps = {
  afterSaveUser: () => {
    console.log('teste');
  },
  initialValues: {
    email: '',
    name: '',
    external: '',
    active: true
  }
};
