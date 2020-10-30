import React, { useEffect, useRef } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { Row } from '@components/Grid';
import notification from '@components/notification';
import Heading from '@components/Heading';
import DefaultModal from '@components/Modal';

import Base from './Base';
import { FormContainer } from '../Form.style';
import getInterventionTemplate from './util/getInterventionTemplate';

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
const formId = 'clinicalNotes';

export default function ClinicalNotes({ prescription, save, afterSave, account, ...props }) {
  const initialValues = useRef(null);
  const { isSaving, success, error, data } = prescription;

  useEffect(() => {
    if (success === formId) {
      notification.success(saveMessage);
      if (afterSave) {
        afterSave();
      }
    }

    if (error) {
      notification.error(errorMessage);
    }
  }, [success, error]); // eslint-disable-line

  useEffect(() => {
    initialValues.current = {
      formId,
      idPrescription: data.idPrescription,
      notes: data.notes ? data.notes : getInterventionTemplate(prescription, account)
    };
  }, [account, data.idPrescription, data.notes, prescription]);

  return (
    <Formik
      enableReinitialize
      onSubmit={save}
      initialValues={initialValues.current}
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
            disabled: isSaving,
            className: 'gtm-bt-save-clinical-notes'
          }}
          cancelButtonProps={{
            disabled: isSaving,
            className: 'gtm-bt-cancel-clinical-notes'
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
