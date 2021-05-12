import React from 'react';
import moment from 'moment';
import 'styled-components/macro';
import { useFormikContext } from 'formik';

import { Col } from '@components/Grid';
import { Textarea, DatePicker } from '@components/Inputs';
import Heading from '@components/Heading';
import Tooltip from '@components/Tooltip';
import Switch from '@components/Switch';

import PatientData from './PatientData';
import DrugData from './DrugData';
import { Box, EditorBox, FieldError } from '../Form.style';

export default function Base({ intervention }) {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const { item: itemToSave } = intervention;
  const { error } = values;
  const layout = { label: 4, input: 20 };

  return (
    <>
      {(itemToSave.intervention.id === 0 || itemToSave.intervention.idPrescriptionDrug === 0) && (
        <PatientData {...itemToSave} />
      )}
      {itemToSave.intervention.id !== 0 && itemToSave.intervention.idPrescriptionDrug !== 0 && (
        <DrugData {...itemToSave} />
      )}
      <Box hasError={errors.error && touched.error}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px">
            <Tooltip
              title="Erro de prescrição com significado clínico é definido como um erro de decisão, não intencional, que pode reduzir a probabilidade do tratamento ser efetivo ou aumentar o risco de lesão no paciente, quando comparado com as praticas clínicas estabelecidas e aceitas. Ref: CFF,  Prot.: MS e Anvisa"
              underline
            >
              Possível Erro de prescrição:
            </Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Switch onChange={value => setFieldValue('error', value)} checked={error} />
          {errors.error && touched.error && <FieldError>{errors.error}</FieldError>}
        </Col>
      </Box>
    </>
  );
}
