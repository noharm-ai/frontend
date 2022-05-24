import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';

import Button from '@components/Button';

import Base from './Base';
import { CustomFormContainer } from '../Form.style';

export default function CustomForm({ onSubmit, onCancel, template }) {
  const initialValues = {};
  const validationShape = {};

  if (template) {
    template.forEach(group => {
      group.questions.forEach(question => {
        if (question.required) {
          validationShape[question.id] = Yup.string()
            .nullable()
            .required('Campo obrigatório');
        }
      });
    });
  }

  const validationSchema = Yup.object().shape(validationShape);

  const submit = values => {
    onSubmit({
      values,
      template
    });
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={submit}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit }) => (
        <CustomFormContainer>
          {!template ? (
            <div className="empty-form">Selecione um formulário para iniciar</div>
          ) : (
            <Base template={template} />
          )}

          {template && (
            <div className="actions">
              <Button onClick={() => onCancel()}>Cancelar</Button>
              <Button onClick={() => handleSubmit()} type="primary">
                Salvar
              </Button>
            </div>
          )}
        </CustomFormContainer>
      )}
    </Formik>
  );
}
