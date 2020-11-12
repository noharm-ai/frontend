import React from 'react';
import 'styled-components/macro';
import { useFormikContext } from 'formik';

import { Col } from '@components/Grid';
import { Textarea } from '@components/Inputs';
import Tooltip from '@components/Tooltip';
import Button from '@components/Button';

import getInterventionTemplate from './util/getInterventionTemplate';
import { Box, EditorBox } from '../Form.style';

export default function Base({ prescription, account, signature }) {
  const { values, setFieldValue, errors } = useFormikContext();
  const { notes } = values;

  const loadDefaultText = () => {
    setFieldValue('notes', getInterventionTemplate(prescription, account, signature));
  };

  return (
    <>
      <Col xs={24} style={{ textAlign: 'right', padding: '0 8px' }}>
        <Tooltip title="Aplicar evolução modelo">
          <Button
            shape="circle"
            icon="download"
            onClick={loadDefaultText}
            type="primary gtm-bt-clinicalNotes-applyDefaultText"
          />
        </Tooltip>
      </Col>
      <Box hasError={errors.observation} flexDirection="column">
        <Col xs={24}>
          <EditorBox>
            <Textarea
              autoFocus
              value={notes}
              onChange={({ target }) => setFieldValue('notes', target.value)}
              style={{ minHeight: '300px' }}
            />
          </EditorBox>
        </Col>
      </Box>
    </>
  );
}
