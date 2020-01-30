import 'styled-components/macro';
import React from 'react';

import { Link } from '@components/Button';
import Heading from '@components/Heading';
import { Row, Col } from '@components/Grid';

export default function PageHeader({ pageTitle }) {
  return (
    <Row type="flex" css="margin-bottom: 30px;">
      <Col span={16} sm={24} xs={24}>
        <Heading>{pageTitle}</Heading>
      </Col>
      <Col
        span={24 - 16}
        sm={24}
        xs={24}
        css="
          text-align: right;

          @media(max-width: 992px) {
            text-align: left;
          }
        "
      >
        <Link href="/segmentos/novo" type="primary">
          Cadastrar Novo Segmento
        </Link>
      </Col>
    </Row>
  );
}
