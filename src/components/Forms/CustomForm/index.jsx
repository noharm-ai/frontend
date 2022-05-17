import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { Row } from '@components/Grid';
import Button from '@components/Button';

import Base from './Base';
import { FormContainer } from '../Form.style';

const template = [
  {
    group: 'Geral',
    questions: [
      {
        id: 'questao-1',
        label: 'Concorda em participar do Programa?',
        type: 'options',
        options: ['Sim', 'Não'],
        required: true
      }
    ]
  },
  {
    group: 'Saúde e Bem Estar',
    questions: [
      {
        id: 'questao-2',
        label: 'Como descreve sua alimentação?',
        type: 'options',
        options: ['Saudável', 'Junk food', 'Vegetariano', 'Vegano'],
        required: false
      }
    ]
  }
];

export default function CustomForm({}) {
  const initialValues = { 'questao-2': 'Vegetariano', 'questao-1': 'Sim' };
  const validationShape = {};

  template.forEach(group => {
    group.questions.forEach(question => {
      if (question.required) {
        validationShape[question.id] = Yup.string()
          .nullable()
          .required('Campo obrigatório');
      }
    });
  });

  const validationSchema = Yup.object().shape(validationShape);

  const submit = values => {
    console.log('values', values);
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
          <Row type="flex" gutter={[16, 24]}>
            <Base template={template} />
          </Row>
          <Row type="flex" gutter={[16, 24]}>
            <Button onClick={() => handleSubmit()}>Salvar</Button>
          </Row>
        </FormContainer>
      )}
    </Formik>
  );
}
