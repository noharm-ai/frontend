import 'styled-components/macro';
import React from 'react';

import { Row, Col } from '@components/Grid';

import Heading from '@components/Heading';
import { Box } from './Intervention.style';

export default function PatientData({ patientName, age, intervention }) {
  if (!patientName) {
    return (
      <Box>
        <Row type="flex" gutter={24} css="padding: 2px 0">
          <Col span={8}>
            <Heading as="p" size="14px">
              Prescrição:
            </Heading>
          </Col>
          <Col span={24 - 8}>#{intervention.idPrescription} (Intervenção no paciente)</Col>
        </Row>
      </Box>
    );
  }

  return (
    <Box>
      <Row type="flex" gutter={24} css="padding: 2px 0">
        <Col span={8}>
          <Heading as="p" size="14px">
            Paciente:
          </Heading>
        </Col>
        <Col span={24 - 8}>{patientName}</Col>
      </Row>
      <Row type="flex" gutter={24} css="padding: 2px 0">
        <Col span={8}>
          <Heading as="p" size="14px">
            Idade:
          </Heading>
        </Col>
        <Col span={24 - 8}>{age}</Col>
      </Row>
    </Box>
  );
}
