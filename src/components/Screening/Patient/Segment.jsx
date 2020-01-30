import 'styled-components/macro';
import React from 'react';

import { Row, Col } from '@components/Grid';
import Heading from '@components/Heading';
import { Wrapper, Box } from './Patient.style';

export default function Segment({ content }) {
  return (
    <Wrapper css="margin-top: 15px;padding: 13px 0;text-align: center;">
      <Row>
        <Col span={24} md={24 / 3}>
          <Box css="flex-direction: column;border: 0">
            <Heading as="span" size="12px">
              Segmento
            </Heading>
            <p>{content.description || '-'}</p>
          </Box>
        </Col>
        <Col span={24} md={24 / 3}>
          <Box css="flex-direction: column;border: 0">
            <Heading as="span" size="12px">
              Idade (Anos)
            </Heading>
            <p>{content.minMaxAge || '-'}</p>
          </Box>
        </Col>
        <Col span={24} md={24 / 3}>
          <Box css="flex-direction: column;border: 0">
            <Heading as="span" size="12px">
              Peso (Kg)
            </Heading>
            <p>{content.minMaxWeight || '-'}</p>
          </Box>
        </Col>
      </Row>
    </Wrapper>
  );
}
