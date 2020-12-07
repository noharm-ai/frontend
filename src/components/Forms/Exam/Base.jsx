import React from 'react';
import 'styled-components/macro';
import { useFormikContext } from 'formik';

import { Col } from '@components/Grid';
import Heading from '@components/Heading';
import { InputNumber, Input, Select } from '@components/Inputs';
import Switch from '@components/Switch';
import Tooltip from '@components/Tooltip';

import { Box } from '../Form.style';

export default function Base({ examTypes, examList }) {
  const { values, setFieldValue, errors } = useFormikContext();
  const { type, name, initials, min, max, ref, active } = values;
  const layout = { label: 8, input: 16 };
  const availableExamTypes = examTypes.list.filter(
    type => examList.findIndex(e => e.type === type) === -1
  );

  return (
    <>
      <Box hasError={errors.type}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip title="">Tipo de Exame:</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Select
            optionFilterProp="children"
            style={{ width: '100%', marginLeft: 10 }}
            showSearch
            placeholder="Selecione o exame..."
            onChange={value => setFieldValue('type', value)}
            value={type}
            loading={examTypes.isFetching}
            disabled={!values.new}
          >
            {availableExamTypes.map(item => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Box>

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

      <Box hasError={errors.initials}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip title="">Rótulo:</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Input
            style={{
              marginLeft: 10
            }}
            value={initials}
            onChange={({ target }) => setFieldValue('initials', target.value)}
            maxLength={50}
          />
        </Col>
      </Box>

      <Box hasError={errors.ref}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip title="">Referência:</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Input
            style={{
              marginLeft: 10
            }}
            value={ref}
            onChange={({ target }) => setFieldValue('ref', target.value)}
            maxLength={250}
          />
        </Col>
      </Box>

      <Box hasError={errors.min}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip title="">Valor mínimo:</Tooltip>
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
            max={999999}
            value={min}
            onChange={value => setFieldValue('min', value)}
          />
        </Col>
      </Box>

      <Box hasError={errors.max}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip title="">Valor máximo:</Tooltip>
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
            max={999999}
            value={max}
            onChange={value => setFieldValue('max', value)}
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
