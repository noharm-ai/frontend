import React, { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Select } from '@components/Inputs';
import Heading from '@components/Heading';
import { Col } from '@components/Grid';
import { AdvancedFilterContext } from '@components/AdvancedFilter';

export default function MainFilters({ segments, fetchDepartmentsList, resetDepartmentsList }) {
  const { t } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  useEffect(() => {
    resetDepartmentsList();
    if (values.idSegment == null) return;

    fetchDepartmentsList(values.idSegment);
  }, [values.idSegment, fetchDepartmentsList, resetDepartmentsList]);

  console.log('mainfilters', values);

  const onChangeSegment = value => {
    setFieldValue({
      idSegment: value,
      idDepartment: []
    });
  };

  return (
    <>
      <Col md={6}>
        <Heading as="label" htmlFor="segments" size="14px">
          {t('screeningList.segment')}:
        </Heading>
        <Select
          id="segments"
          style={{ width: '100%' }}
          loading={segments.isFetching}
          onChange={onChangeSegment}
          value={values.idSegment}
        >
          {segments.list.map(({ id, description: text }) => (
            <Select.Option key={id} value={id}>
              {text}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col md={6}>
        <Heading as="label" htmlFor="departments" size="14px">
          {t('screeningList.labelDepartment')}:
        </Heading>
        <Select
          id="departments"
          mode="multiple"
          optionFilterProp="children"
          style={{ width: '100%' }}
          placeholder={t('screeningList.labelDepartmentPlaceholder')}
          loading={segments.single.isFetching}
          value={values.idDepartment}
          onChange={value => setFieldValue({ idDepartment: value })}
          autoClearSearchValue={false}
          allowClear
        >
          {segments.single.content.departments &&
            segments.single.content.departments.map(({ idDepartment, name }) => (
              <Select.Option key={idDepartment} value={idDepartment}>
                {name}
              </Select.Option>
            ))}
        </Select>
      </Col>
    </>
  );
}
