import 'styled-components/macro';
import React from 'react';

import { Row, Col } from '@components/Grid';

import Heading from '@components/Heading';
import { FormHeader } from '@components/Forms/Form.style';

export default function DrugData({ drug, dosage, frequency, route }) {
  return (
    <FormHeader>
      <Row type="flex" gutter={24} css="padding: 2px 0">
        <Col span={8}>
          <Heading as="p" size="14px">
            Medicamento:
          </Heading>
        </Col>
        <Col span={24 - 8}>{drug}</Col>
      </Row>
      <Row type="flex" gutter={24} css="padding: 2px 0">
        <Col span={8}>
          <Heading as="p" size="14px">
            Dose:
          </Heading>
        </Col>
        <Col span={24 - 8}>{dosage}</Col>
      </Row>
      <Row type="flex" gutter={24} css="padding: 2px 0">
        <Col span={8}>
          <Heading as="p" size="14px">
            Frequência:
          </Heading>
        </Col>
        <Col span={24 - 8}>{frequency && `${frequency.value} ${frequency.label}`}</Col>
      </Row>
      <Row type="flex" gutter={24} css="padding: 2px 0">
        <Col span={8}>
          <Heading as="p" size="14px">
            Via:
          </Heading>
        </Col>
        <Col span={24 - 8}>{route}</Col>
      </Row>
    </FormHeader>
  );
}
