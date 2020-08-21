import React, { useEffect } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { Row } from '@components/Grid';
import Button from '@components/Button';
import notification from '@components/notification';
import Icon from '@components/Icon';

import Base from './Base';
import { Footer, FormContainer } from './User.style';
 
const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description:
    'Aconteceu algo que nos impediu de salvar as suas configurações de usuário. Por favor, tente novamente.'
};

const saveMessage = {
  message: 'Uhu! Usuário salvo com sucesso! :)'
};
const validationSchema = Yup.object().shape({
  id: Yup.number()
});


export default function User({
  saveStatus,
  saveUser,
  afterSaveUser,
  idUser
}) {
  const { isSaving, success, error } = saveStatus;

  const initialValues = {
    id: idUser,
  };

  useEffect(() => {
    if (success) {
      notification.success(saveMessage);
      afterSaveUser();
    }

    if (error) {
      notification.error(errorMessage);
    }
  }, [success, error, afterSaveUser]);

  return (
    <Formik
      enableReinitialize
      onSubmit={saveUser}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, isValid }) => (
        <form onSubmit={handleSubmit}>
          <FormContainer>
            <Row type="flex" gutter={[16, 24]}>
              <Base />
            </Row>
          </FormContainer>
          <Footer>
            <Button
              type="primary gtm-bt-save-user"
              htmlType="submit"
              disabled={isSaving || !isValid}
            >
              Salvar <Icon type="check" />
            </Button>
          </Footer>
        </form>
      )}
    </Formik>
  );
}

User.defaultProps = {
  afterSaveDrug: () => {},
  initialValues: {
    idMeasureUnit: '',
    antimicro: '',
    mav: '',
    controlled: '',
    notdefault: '',
    unit: ''
  }
};
