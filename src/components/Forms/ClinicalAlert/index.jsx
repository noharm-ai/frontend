import React, { useEffect } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import { Row } from '@components/Grid';
import notification from '@components/notification';
import Heading from '@components/Heading';
import DefaultModal from '@components/Modal';

import Base from './Base';
import { FormContainer } from '../Form.style';

const saveMessage = {
  message: 'Uhu! Alerta salvo com sucesso! :)'
};
const requiredFieldMessage = 'Campo obrigatório';
const validationSchema = Yup.object().shape({
  alert: Yup.string()
    .nullable()
    .required(requiredFieldMessage),
  alertExpire: Yup.string()
    .nullable()
    .required(requiredFieldMessage)
});
const formId = 'clinicalAlert';

export default function ClinicalAlert({ prescription, save, afterSave, ...props }) {
  const { t } = useTranslation();
  const { isSaving, success, error, data } = prescription;

  const initialValues = {
    formId,
    admissionNumber: data.admissionNumber,
    alert: data.alert,
    alertExpire: data.alertExpire
  };

  useEffect(() => {
    if (success === formId) {
      notification.success(saveMessage);
      if (afterSave) {
        afterSave();
      }
    }

    if (error) {
      notification.error({
        message: t('error.title'),
        description: t('error.description')
      });
    }
  }, [success, error]); // eslint-disable-line

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
            disabled: isSaving,
            className: 'gtm-bt-save-alert'
          }}
          cancelButtonProps={{
            disabled: isSaving,
            className: 'gtm-bt-cancel-alert'
          }}
        >
          <header>
            <Heading margin="0 0 11px">Alerta</Heading>
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
