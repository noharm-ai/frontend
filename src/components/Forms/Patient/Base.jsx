import React from 'react';
import 'styled-components/macro';
import { useFormikContext } from 'formik';

import { Col } from '@components/Grid';
import Heading from '@components/Heading';
import { InputNumber } from '@components/Inputs';
import Tooltip from '@components/Tooltip';
import Editor from '@components/Editor';

import { Box, EditorBox } from '../Form.style';

export default function Base() {
  const { values, setFieldValue, errors } = useFormikContext();
  const { weight, height, observation } = values;
  const layout = { label: 8, input: 16 };

  return (
    <>
      <Box hasError={errors.weight}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip title="">Peso:</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <InputNumber
            style={{
              width: 120,
              marginLeft: 10,
              marginRight: 5
            }}
            min={0}
            max={99999}
            value={weight}
            onChange={value => setFieldValue('weight', value)}
          />{' '}
          Kg
        </Col>
      </Box>

      <Box hasError={errors.height}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip title="">Altura:</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <InputNumber
            style={{
              width: 120,
              marginLeft: 10,
              marginRight: 5
            }}
            min={0}
            max={99999}
            value={height}
            onChange={value => setFieldValue('height', value)}
          />{' '}
          cm
        </Col>
      </Box>

      <Box hasError={errors.observation} flexDirection="column">
        <Col xs={24} style={{ paddingBottom: '0' }}>
          <Heading as="label" size="14px">
            <Tooltip title="">Anotações:</Tooltip>
          </Heading>
        </Col>
        <Col xs={24}>
          <EditorBox>
            <Editor
              onEdit={value => setFieldValue('observation', value)}
              content={observation || ''}
              onInit={editor => {
                editor.editing.view.focus();
              }}
            />
          </EditorBox>
        </Col>
      </Box>
    </>
  );
}
