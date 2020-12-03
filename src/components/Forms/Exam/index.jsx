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
    'Aconteceu algo que nos impediu de salvar os dados deste exame. Por favor, tente novamente.'
};

const saveMessage = {
  message: 'Uhu! Exame salvo com sucesso! :)'
};
const validationSchema = Yup.object().shape({
  type: Yup.string().required(),
  name: Yup.string().required(),
  initials: Yup.string().required(),
  ref: Yup.string().required(),
  min: Yup.number().required(),
  max: Yup.number().required()
});

export default function Exam({
  saveStatus,
  save,
  afterSave,
  fetchExamTypes,
  examTypes,
  examList,
  ...props
}) {
  const { isSaving, success, error, item } = saveStatus;
  const { order, ...data } = item;

  const initialValues = {
    ...data
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

  useEffect(() => {
    fetchExamTypes();
  }, [fetchExamTypes]);

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
                <Base examTypes={examTypes} examList={examList} />
              </Row>
            </FormContainer>
          </form>
        </DefaultModal>
      )}
    </Formik>
  );
}

Exam.defaultProps = {
  afterSave: () => {},
  initialValues: {
    type: '',
    name: '',
    active: true
  }
};
