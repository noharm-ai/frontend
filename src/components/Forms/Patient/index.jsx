import React, { useEffect } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import Alert from '@components/Alert';
import { Row } from '@components/Grid';
import notification from '@components/notification';
import Heading from '@components/Heading';
import DefaultModal from '@components/Modal';

import Base from './Base';
import { FormContainer } from './Patient.style';

const saveMessage = {
  message: 'Uhu! Dados do paciente salvo com sucesso! :)'
};
const validationSchema = Yup.object().shape({
  weight: Yup.number().nullable(),
  height: Yup.number().nullable()
});

export default function Patient({
  saveStatus,
  savePatient,
  afterSavePatient,
  idPrescription,
  admissionNumber,
  weight,
  height,
  observation,
  clinicalNotes,
  notesInfo,
  notesInfoDate,
  security,
  ...props
}) {
  const { t } = useTranslation();
  const { isSaving, success, error } = saveStatus;
  const hasNoHarmCare = security.hasNoHarmCare();

  const initialValues = {
    idPrescription,
    admissionNumber,
    weight,
    height,
    observation
  };

  useEffect(() => {
    if (success) {
      notification.success(saveMessage);
      afterSavePatient();
    }

    if (error) {
      notification.error({
        message: t('error.title'),
        description: t('error.description')
      });
    }
  }, [success, error, afterSavePatient, t]);

  return (
    <Formik
      enableReinitialize
      onSubmit={savePatient}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit }) => (
        <DefaultModal
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
            className: 'gtm-bt-cancel-edit-patient'
          }}
        >
          <header>
            <Heading margin="0 0 11px">Dados do paciente</Heading>
          </header>
          {hasNoHarmCare && notesInfo && (
            <Alert
              message={`NoHarm Care (${moment(notesInfoDate).format('DD/MM/YYYY hh:mm')})`}
              description={notesInfo}
              type="info"
              showIcon
            />
          )}
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

Patient.defaultProps = {
  afterSavePatient: () => {},
  initialValues: {
    weight: '',
    height: ''
  }
};
