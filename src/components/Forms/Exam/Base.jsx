import React from 'react';
import 'styled-components/macro';
import { useFormikContext } from 'formik';

import { Col } from '@components/Grid';
import Heading from '@components/Heading';
import { InputNumber, Input, Select } from '@components/Inputs';
import Switch from '@components/Switch';
import Tooltip from '@components/Tooltip';

import { Box } from '../Form.style';

export default function Base({ examTypes }) {
  const { values, setFieldValue, errors } = useFormikContext();
  const { type, name, initials, min, max, ref, active } = values;

  return (
    <>
      <Col xs={24}>
        <Box hasError={errors.type}>
          <Heading as="label" size="14px">
            <Tooltip title="">Exame:</Tooltip>
          </Heading>
          <Select
            optionFilterProp="children"
            style={{ width: '100%', marginLeft: 10 }}
            placeholder="Selecione o exame..."
            onChange={value => setFieldValue('type', value)}
            value={type}
            loading={examTypes.isFetching}
            disabled={!values.new}
          >
            {examTypes.list.map(item => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </Box>
      </Col>
      <Col xs={24}>
        <Box hasError={errors.name}>
          <Heading as="label" size="14px">
            <Tooltip title="">Nome:</Tooltip>
          </Heading>
          <Input
            style={{
              marginLeft: 10
            }}
            value={name}
            onChange={({ target }) => setFieldValue('name', target.value)}
            maxLength={250}
          />
        </Box>
      </Col>
      <Col xs={24}>
        <Box hasError={errors.initials}>
          <Heading as="label" size="14px">
            <Tooltip title="">Iniciais:</Tooltip>
          </Heading>
          <Input
            style={{
              marginLeft: 10
            }}
            value={initials}
            onChange={({ target }) => setFieldValue('initials', target.value)}
            maxLength={50}
          />
        </Box>
      </Col>
      <Col xs={24}>
        <Box hasError={errors.ref}>
          <Heading as="label" size="14px">
            <Tooltip title="">Ref.:</Tooltip>
          </Heading>
          <Input
            style={{
              marginLeft: 10
            }}
            value={ref}
            onChange={({ target }) => setFieldValue('ref', target.value)}
            maxLength={250}
          />
        </Box>
      </Col>
      <Col xs={24}>
        <Box hasError={errors.min}>
          <Heading as="label" size="14px">
            <Tooltip title="">Valor mínimo:</Tooltip>
          </Heading>
          <InputNumber
            style={{
              width: 120,
              marginLeft: 10,
              marginRight: 5
            }}
            min={0}
            max={99999}
            value={min}
            onChange={value => setFieldValue('min', value)}
          />
        </Box>
      </Col>
      <Col xs={24}>
        <Box hasError={errors.max}>
          <Heading as="label" size="14px">
            <Tooltip title="">Valor máximo:</Tooltip>
          </Heading>
          <InputNumber
            style={{
              width: 120,
              marginLeft: 10,
              marginRight: 5
            }}
            min={0}
            max={99999}
            value={max}
            onChange={value => setFieldValue('max', value)}
          />
        </Box>
      </Col>

      <Col xs={24}>
        <Box hasError={errors.active}>
          <Heading as="label" size="14px">
            <Tooltip title="">Ativo:</Tooltip>
          </Heading>
          <Switch
            onChange={active => setFieldValue('active', active)}
            checked={active}
            style={{
              marginLeft: 10,
              marginRight: 5
            }}
          />
        </Box>
      </Col>
    </>
  );
}
