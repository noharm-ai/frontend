import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { Input } from '@components/Inputs';
import Heading from '@components/Heading';
import { Col, Row } from '@components/Grid';
import { AdvancedFilterContext } from '@components/AdvancedFilter';

export default function MainFilters() {
  const { t } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <Row gutter={[20, 20]}>
      <Col md={24} xl={18} xxl={14}>
        <Heading as="label" htmlFor="segments" size="14px">
          {t('screeningList.labelDepartment')}:
        </Heading>
        <Input
          placeholder={t('screeningList.labelDepartmentPlaceholder')}
          value={values.test}
          onChange={ev => setFieldValue('test', ev.target.value)}
        />
      </Col>
    </Row>
  );
}
