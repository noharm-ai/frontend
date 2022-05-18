import React, { useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';

import MemoryText from '@containers/MemoryText';

import { Row } from '@components/Grid';
import Button from '@components/Button';

import { CUSTOM_FORM_STORE_ID, CUSTOM_FORM_MEMORY_TYPE } from '@utils/memory';

import Base from './Base';
import { FormContainer } from '../Form.style';

export default function CustomForm({ onSubmit, onCancel }) {
  const [template, setTemplate] = useState(null);
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
        <FormContainer>
          <div className="load-form">
            <MemoryText
              storeId={CUSTOM_FORM_STORE_ID}
              memoryType={CUSTOM_FORM_MEMORY_TYPE}
              onLoad={value => setTemplate(value)}
              canSave={false}
            />
          </div>
          <Row type="flex" gutter={[16, 24]}>
            {!template ? (
              <div className="empty-form">Selecione um formulário para iniciar</div>
            ) : (
              <Base template={template} />
            )}
          </Row>
          {template && (
            <div className="actions">
              <Button onClick={() => onCancel()}>Cancelar</Button>
              <Button onClick={() => handleSubmit()} type="primary">
                Salvar
              </Button>
            </div>
          )}
        </FormContainer>
      )}
    </Formik>
  );
}
