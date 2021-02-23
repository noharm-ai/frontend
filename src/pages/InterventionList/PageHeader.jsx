import 'styled-components/macro';
import React from 'react';

import Heading from '@components/Heading';
import { Row, Col } from '@components/Grid';
import { useTranslation } from 'react-i18next';

export default function PageHeader() {
  const { t } = useTranslation();
  return (
    <Row type="flex" css="margin-bottom: 30px;">
      <Col span={16} sm={12} xs={24}>
        <Heading>{t('menu.interventions')}</Heading>
        <p>Lista de intervenções registradas.</p>
      </Col>
    </Row>
  );
}
