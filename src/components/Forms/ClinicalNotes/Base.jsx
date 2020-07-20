import React from 'react';
import 'styled-components/macro';
import { useFormikContext } from 'formik';

import { Col } from '@components/Grid';
import { Textarea } from '@components/Inputs';

import { Box, EditorBox } from '../Form.style';

export default function Base() {
  const { values, setFieldValue, errors } = useFormikContext();
  const { notes } = values;

  return (
    <>
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
