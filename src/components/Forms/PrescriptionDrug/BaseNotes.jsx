import 'styled-components/macro';
import React from 'react';
import { useFormikContext } from 'formik';

import { Col } from '@components/Grid';
import Editor from '@components/Editor';

import { Box, FieldError, EditorBox } from '../Form.style';

export default function Base() {
  const { values, setFieldValue, errors, touched } = useFormikContext();

  const { notes } = values;

  return (
    <>
      <Box hasError={errors.notes && touched.notes}>
        <Col xs={24}>
          <EditorBox>
            <Editor
              onEdit={value => setFieldValue('notes', value)}
              content={notes || ''}
              onInit={editor => {
                editor.editing.view.focus();
              }}
            />
          </EditorBox>

          {errors.notes && touched.notes && <FieldError>{errors.notes}</FieldError>}
        </Col>
      </Box>
    </>
  );
}
