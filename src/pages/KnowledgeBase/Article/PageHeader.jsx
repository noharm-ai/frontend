import 'styled-components/macro';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Link } from '@components/Button';
import Heading from '@components/Heading';
import { Row, Col } from '@components/Grid';

export default function PageHeader() {
  const { t } = useTranslation();

  return (
    <Row type="flex" css="margin-bottom: 30px;">
      <Col span={16} sm={12} xs={24}>
        <Heading>{t('menu.knowledgeBase')}</Heading>
      </Col>
      <Col
        span={24 - 16}
        sm={12}
        xs={24}
        css="
          text-align: right;

          @media(max-width: 992px) {
            text-align: left;
          }
        "
      >
        <Link href="/base-de-conhecimento">{t('layout.goBack')}</Link>
      </Col>
    </Row>
  );
}
