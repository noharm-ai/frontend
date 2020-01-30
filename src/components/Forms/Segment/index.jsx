import React, { useEffect } from 'react';
import { Formik } from 'formik';
import isEmpty from 'lodash.isempty';
import * as Yup from 'yup';

import { Row } from '@components/Grid';
import Button, { Link } from '@components/Button';
import notification from '@components/notification';

import Base from './Base';
import Departments from './Departments';
import { Footer } from './Segment.style';

// error message when save has error.
const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description: 'Aconteceu algo que nos impediu de salvar os dados deste segmento. Por favor, tente novamente.'
};
// save message when saved intervention.
const saveMessage = {
  message: 'Uhu! Segmento salvo com sucesso! :)'
};
const validationSchema = Yup.object().shape({
  id: Yup.number(),
  minAge: Yup.number().required(),
  maxAge: Yup.number().required(),
  minWeight: Yup.number().required(),
  maxWeight: Yup.number().required(),
  description: Yup.string().required(),
  departments: Yup.array()
});

export default function Segment({ initialValues, departments, saveStatus, saveSegment, fetchDepartments, afterSaveSegment }) {
  const { isSaving, success, error } = saveStatus;
  const departmentsList = [...departments.list, ...initialValues.departments];
  const defaultValues = !isEmpty(initialValues.departments) ? initialValues.departments.map(({ idDepartment }) => idDepartment) : [];

  // fetch departments.
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    if (success) {
      notification.success(saveMessage);
      fetchDepartments();
      afterSaveSegment();
    }

    if (error) {
      notification.error(errorMessage);
    }
  }, [success, error, afterSaveSegment, fetchDepartments]);

  return (
    <Formik
      enableReinitialize
      onSubmit={saveSegment}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, isValid }) => (
        <form onSubmit={handleSubmit}>
          <Row type="flex" gutter={24}>
            <Base />
            <Departments defaultValue={defaultValues} isFetching={departments.isFetching} list={departmentsList} />
          </Row>
          <Footer>
            <Link href="/segmentos" disabled={isSaving}>
              {success ? 'Voltar' : 'Cancelar'}
            </Link>
            <Button type="primary" htmlType="submit" disabled={isSaving || !isValid}>
              Salvar
            </Button>
          </Footer>
        </form>
      )}
    </Formik>
  );
}

Segment.defaultProps = {
  afterSaveSegment: () => {},
  initialValues: {
    minAge: '',
    maxAge: '',
    minWeight: '',
    maxWeight: '',
    description: '',
    departments: []
  }
};
