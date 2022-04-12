import React, { useState } from 'react';
import isEmpty from 'lodash.isempty';
import { useTranslation } from 'react-i18next';

import Tooltip from '@components/Tooltip';
import Button from '@components/Button';
import { Row, Col } from '@components/Grid';
import Icon from '@components/Icon';
import Badge from '@components/Badge';

import { SearchBox } from './index.style';

export const AdvancedFilterContext = React.createContext({});

export default function AdvancedFilter({
  mainFilters,
  secondaryFilters,
  initialValues,
  onSearch,
  loading,
  skipFilterList
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(initialValues);
  const { t } = useTranslation();

  const setFieldValue = newValues => {
    setValues({ ...values, ...newValues });
  };

  const countHiddenFilters = filters => {
    const skip = skipFilterList;
    let count = 0;

    Object.keys(filters).forEach(key => {
      if (skip.indexOf(key) !== -1) return;

      if (!isEmpty(filters[key]) || filters[key] === true || filters[key] === 1) {
        count++;
      }
    });

    return count;
  };

  const search = () => {
    setOpen(false);
    onSearch(values);
  };

  const reset = () => {
    setValues(initialValues);
    search();
  };

  const hiddenFieldCount = countHiddenFilters(values);

  return (
    <SearchBox className={open ? 'open' : ''}>
      <AdvancedFilterContext.Provider value={{ values, setFieldValue }}>
        <Row gutter={[16, 16]} type="flex">
          {mainFilters}
          <Col md={4}>
            <div style={{ display: 'flex' }}>
              {secondaryFilters && (
                <Tooltip title={hiddenFieldCount > 0 ? 'Existem mais filtros aplicados' : ''}>
                  <Button
                    type="link gtm-btn-adv-search"
                    onClick={() => setOpen(!open)}
                    style={{ marginTop: '14px', paddingLeft: 0 }}
                  >
                    <Badge count={hiddenFieldCount}>{t('screeningList.seeMore')}</Badge>
                    <Icon type={open ? 'caret-up' : 'caret-down'} />
                  </Button>
                </Tooltip>
              )}

              <Tooltip title={t('screeningList.search')}>
                <Button
                  type="secondary gtm-btn-search"
                  shape="circle"
                  icon="search"
                  onClick={search}
                  size="large"
                  style={{ marginTop: '7px' }}
                  loading={loading}
                />
              </Tooltip>
              <Tooltip title={t('screeningList.resetFilter')}>
                <Button
                  className="gtm-btn-reset"
                  shape="circle"
                  icon="delete"
                  onClick={reset}
                  style={{ marginTop: '11px', marginLeft: '5px' }}
                  loading={loading}
                />
              </Tooltip>
            </div>
          </Col>
        </Row>
        {secondaryFilters && <div className="filters">{secondaryFilters}</div>}
      </AdvancedFilterContext.Provider>
    </SearchBox>
  );
}
