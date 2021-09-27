import React from 'react';
import 'styled-components/macro';
import { useFormikContext } from 'formik';

import { Col } from '@components/Grid';
import Heading from '@components/Heading';
import { InputNumber, Input, Select } from '@components/Inputs';
import Switch from '@components/Switch';
import Tooltip from '@components/Tooltip';

import { Box } from '../Form.style';

export default function Base({}) {
  const { values, setFieldValue, errors } = useFormikContext();
  const { name, email, external, active } = values;
  const layout = { label: 8, input: 16 };

  return (
    <>
      <Box hasError={errors.name}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip title="">Nome:</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Input
            style={{
              marginLeft: 10
            }}
            value={name}
            onChange={({ target }) => setFieldValue('name', target.value)}
            maxLength={250}
          />
        </Col>
      </Box>

      <Box hasError={errors.email}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip title="">Email:</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Input
            style={{
              marginLeft: 10
            }}
            value={email}
            onChange={({ target }) => setFieldValue('email', target.value)}
            maxLength={50}
          />
        </Col>
      </Box>

      <Box hasError={errors.external}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip title="">Id Externo:</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Input
            style={{
              marginLeft: 10
            }}
            value={external}
            onChange={({ target }) => setFieldValue('external', target.value)}
            maxLength={250}
          />
        </Col>
      </Box>

      <Box hasError={errors.active}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip title="">Ativo:</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Switch
            onChange={active => setFieldValue('active', active)}
            checked={active}
            style={{
              marginLeft: 10,
              marginRight: 5
            }}
          />
        </Col>
      </Box>
    </>
  );
}
