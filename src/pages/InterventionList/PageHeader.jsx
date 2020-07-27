import 'styled-components/macro';
import React from 'react';

import Heading from '@components/Heading';
import { Row, Col } from '@components/Grid';

export default function PageHeader({ userName }) {
  return (
    <Row type="flex" css="margin-bottom: 30px;">
      <Col span={16} sm={12} xs={24}>
        <Heading>Intervenções</Heading>
        <p>Lista de intervenções criadas por {userName}.</p>
      </Col>
    </Row>
  );
}
