import React from 'react';
import { useFormikContext } from 'formik';

import { Col } from '@components/Grid';

import Field from './Field';

export default function Base() {
  const { values, setFieldValue } = useFormikContext();
  const { minAge, maxAge, minWeight, maxWeight, description } = values;

  return (
    <Col md={9} xs={24}>
      <Field
        labelText="Nome:"
        value={description}
        identify="description"
        onChange={setFieldValue}
        placeholder="Nome do segmento"
      />
      <Field
        optional
        type="number"
        value={minAge}
        identify="minAge"
        placeholder="Idade..."
        onChange={setFieldValue}
        labelText="Idade início (anos):"
      />
      <Field
        optional
        type="number"
        value={maxAge}
        identify="maxAge"
        placeholder="Idade..."
        onChange={setFieldValue}
        labelText="Idade fim (anos):"
      />
      <Field
        optional
        type="number"
        value={minWeight}
        identify="minWeight"
        placeholder="Peso..."
        onChange={setFieldValue}
        labelText="Peso início (Kg):"
      />
      <Field
        optional
        type="number"
        value={maxWeight}
        identify="maxWeight"
        placeholder="Peso..."
        onChange={setFieldValue}
        labelText="Peso fim (Kg):"
      />
    </Col>
  );
}
