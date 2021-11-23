import React from 'react';
import { useTranslation } from 'react-i18next';

import { Select, InputNumber } from '@components/Inputs';
import { Col } from '@components/Grid';
import Heading from '@components/Heading';

import { Box, FieldError, InternalBox } from '../../Form.style';

export default function Transcription({ setFieldValue, layout, errors, touched, values }) {
  const { t } = useTranslation();
  const { dose, frequency, route, measureUnit } = values;

  return (
    <>
      <Heading as="label" size="14px" style={{ marginLeft: '8px', marginTop: '10px' }}>
        {t('labels.transcription')}
      </Heading>
      <InternalBox>
        <Box hasError={errors.dose && touched.dose}>
          <Col xs={layout.label}>
            <Heading as="label" size="14px">
              {t('tableHeader.dose')}:
            </Heading>
          </Col>
          <Col xs={layout.input}>
            <InputNumber
              id="dose"
              style={{ width: 'min(100%, 115px)' }}
              value={dose}
              onChange={value => setFieldValue('dose', value)}
            />
            {errors.dose && touched.dose && <FieldError>{errors.dose}</FieldError>}
          </Col>
        </Box>
        <Box hasError={errors.measureUnit && touched.measureUnit}>
          <Col xs={layout.label}>
            <Heading as="label" size="14px">
              {t('tableHeader.measureUnit')}:
            </Heading>
          </Col>
          <Col xs={layout.input}>
            <Select
              id="measureUnit"
              optionFilterProp="children"
              style={{ width: '100%' }}
              value={measureUnit}
              onChange={value => setFieldValue('measureUnit', value)}
            >
              <Select.Option key="1" value="1">
                Teste
              </Select.Option>
            </Select>
            {errors.measureUnit && touched.measureUnit && (
              <FieldError>{errors.measureUnit}</FieldError>
            )}
          </Col>
        </Box>
        <Box hasError={errors.route && touched.route}>
          <Col xs={layout.label}>
            <Heading as="label" size="14px">
              {t('tableHeader.route')}:
            </Heading>
          </Col>
          <Col xs={layout.input}>
            <Select
              id="route"
              optionFilterProp="children"
              style={{ width: '100%' }}
              value={route}
              onChange={value => setFieldValue('route', value)}
            >
              <Select.Option key="1" value="1">
                Teste
              </Select.Option>
            </Select>
            {errors.route && touched.route && <FieldError>{errors.route}</FieldError>}
          </Col>
        </Box>
        <Box hasError={errors.frequency && touched.frequency}>
          <Col xs={layout.label}>
            <Heading as="label" size="14px">
              {t('tableHeader.frequency')}:
            </Heading>
          </Col>
          <Col xs={layout.input}>
            <Select
              id="frequency"
              optionFilterProp="children"
              style={{ width: '100%' }}
              placeholder=""
              value={frequency}
              onChange={value => setFieldValue('frequency', value)}
            >
              <Select.Option key="1" value="1">
                Teste
              </Select.Option>
            </Select>
            {errors.frequency && touched.frequency && <FieldError>{errors.frequency}</FieldError>}
          </Col>
        </Box>
      </InternalBox>
    </>
  );
}
