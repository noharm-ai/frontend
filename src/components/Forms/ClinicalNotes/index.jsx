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
    'Aconteceu algo que nos impediu de salvar os dados desta evolução. Por favor, tente novamente.'
};

const saveMessage = {
  message: 'Uhu! Evolução salva com sucesso! :)'
};
const validationSchema = Yup.object().shape({
  idPrescription: Yup.number().required()
});

export default function ClinicalNotes({ prescription, save, afterSave, ...props }) {
  const { isSaving, success, error, data } = prescription;

  const initialValues = {
    idPrescription: data.idPrescription,
    notes: data.notes
  };

  useEffect(() => {
    if (success) {
      notification.success(saveMessage);
      if (afterSave) {
        afterSave();
      }
    }

    if (error) {
      notification.error(errorMessage);
    }
  }, [success, error, afterSave]);

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
            className: 'gtm-bt-cancel-evoluir'
          }}
        >
          <header>
            <Heading margin="0 0 11px">Evolução</Heading>
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
