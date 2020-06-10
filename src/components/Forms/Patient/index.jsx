import React, { useEffect } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { Row } from '@components/Grid';
import notification from '@components/notification';
import Heading from '@components/Heading';

import Base from './Base';
import { FormContainer } from './Patient.style';

const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description:
    'Aconteceu algo que nos impediu de salvar os dados deste medicamento. Por favor, tente novamente.'
};

const saveMessage = {
  message: 'Uhu! Dados do paciente salvos com sucesso! :)'
};
const validationSchema = Yup.object().shape({
  id: Yup.number()
});

export default function Patient({
  saveStatus,
  savePatient,
  afterSavePatient,
  idPrescription,
  admissionNumber,
  weight
}) {
  //const { isSaving, success, error } = saveStatus;
  const isSaving = false;
  const success = false;
  const error = null;

  const initialValues = {
    idPrescription,
    admissionNumber,
    weight
  };

  useEffect(() => {
    if (success) {
      notification.success(saveMessage);
      afterSavePatient();
    }

    if (error) {
      notification.error(errorMessage);
    }
  }, [success, error, afterSavePatient]);

  return (
    <>
      <header>
        <Heading margin="0 0 11px">Dados do paciente</Heading>
      </header>
      <Formik
        enableReinitialize
        onSubmit={savePatient}
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
          </form>
        )}
      </Formik>
    </>
  );
}

Patient.defaultProps = {
  afterSavePatient: () => {},
  initialValues: {
    weight: ''
  }
};
