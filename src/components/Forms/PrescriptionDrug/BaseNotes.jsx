import 'styled-components/macro';
import React from 'react';
import { useFormikContext } from 'formik';

import { Col } from '@components/Grid';
import Editor from '@components/Editor';

import DrugData from '../Intervention/DrugData';
import { Box, FieldError, EditorBox } from '../Form.style';

export default function BaseNotes({ item }) {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const { notes } = values;

  return (
    <>
      <DrugData {...item} />
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
