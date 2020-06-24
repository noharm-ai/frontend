import React, { useEffect } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { Row } from '@components/Grid';
import Button from '@components/Button';
import notification from '@components/notification';

import Departments from './Departments';
import { Footer } from './Segment.style';

// error message when save has error.
const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description:
    'Aconteceu algo que nos impediu de salvar os dados deste segmento. Por favor, tente novamente.'
};
// save message when saved intervention.
const saveMessage = {
  message: 'Uhu! Segmento salvo com sucesso! :)'
};
const validationSchema = Yup.object().shape({
  id: Yup.number(),
  description: Yup.string().required(),
  departments: Yup.array()
});

export default function Segment({
  initialValues,
  departments,
  saveStatus,
  saveSegment,
  fetchDepartments,
  afterSaveSegment,
  segmentDepartments
}) {
  const { isSaving, success, error } = saveStatus;
  const departmentsList = [...departments.list, ...segmentDepartments];

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
            <Departments isFetching={departments.isFetching} list={departmentsList} />
          </Row>
          <Footer>
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
    description: '',
    departments: []
  }
};
