import React from 'react';
import { useFormikContext } from 'formik';

import { Col } from '@components/Grid';

import Field from './Field';

export default function Base() {
  const { values, setFieldValue } = useFormikContext();
  const { description } = values;

  return (
    <Col md={9} xs={24}>
      <Field
        labelText="Nome:"
        value={description}
        identify="description"
        onChange={setFieldValue}
        placeholder="Nome do segmento"
      />
    </Col>
  );
}
