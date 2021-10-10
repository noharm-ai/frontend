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
  message: 'Uhu! Substância salva com sucesso! :)'
};
const validationSchema = Yup.object().shape({
  sctid: Yup.number().required(),
  name: Yup.string().required()
});

export default function Substance({ saveStatus, save, afterSave, ...props }) {
  const { t } = useTranslation();
  const { isSaving, success, error, item } = saveStatus;

  const initialValues = {
    ...item
  };

  useEffect(() => {
    if (success) {
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
            className: 'gtm-bt-cancel-edit-substance'
          }}
        >
          <header>
            <Heading margin="0 0 11px">Substância</Heading>
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
