import 'styled-components/macro';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Row, Col } from '@components/Grid';

import Heading from '@components/Heading';
import { FormHeader } from '@components/Forms/Form.style';

export default function PatientData({ patientName, age, intervention }) {
  const { t } = useTranslation();

  if (!patientName) {
    return (
      <FormHeader>
        <Row type="flex" gutter={24} css="padding: 2px 0">
          <Col span={8}>
            <Heading as="p" size="14px">
              {t('patientCard.prescription')}:
            </Heading>
          </Col>
          <Col span={24 - 8}>
            #{intervention.idPrescription} ({t('patientCard.patientIntervention')})
          </Col>
        </Row>
      </FormHeader>
    );
  }

  return (
    <FormHeader>
      <Row type="flex" gutter={24} css="padding: 2px 0">
        <Col span={8}>
          <Heading as="p" size="14px">
            {t('patientCard.patient')}:
          </Heading>
        </Col>
        <Col span={24 - 8}>{patientName}</Col>
      </Row>
      <Row type="flex" gutter={24} css="padding: 2px 0">
        <Col span={8}>
          <Heading as="p" size="14px">
            {t('patientCard.age')}:
          </Heading>
        </Col>
        <Col span={24 - 8}>{age}</Col>
      </Row>
    </FormHeader>
  );
}
