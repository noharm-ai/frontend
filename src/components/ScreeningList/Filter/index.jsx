import React, { useEffect, useState, useCallback } from 'react';
import isEmpty from 'lodash.isempty';
import moment from 'moment';
import 'moment/locale/pt-br';
import { subDays } from 'date-fns';
import debounce from 'lodash.debounce';
import { useTranslation } from 'react-i18next';

import message from '@components/message';
import Heading from '@components/Heading';
import { Row, Col } from '@components/Grid';
import { Select, RangeDatePicker, Checkbox } from '@components/Inputs';
import Switch from '@components/Switch';
import Tooltip from '@components/Tooltip';
import Button from '@components/Button';
import Icon from '@components/Icon';
import Badge from '@components/Badge';
import LoadBox from '@components/LoadBox';
import FilterMemory from './components/FilterMemory';

import { Box, SearchBox } from './Filter.style';
import './index.css';

export default function Filter({
  fetchPrescriptionsList,
  segments,
  fetchDepartmentsList,
  resetDepartmentsLst,
  updatePrescriptionListStatus,
  filter,
  setScreeningListFilter,
  isFetchingPrescription,
  savedFilters,
  drugs,
  searchDrugs,
  match,
  prioritizationType,
  hasPeriodLimit,
  fetchMemory,
  saveMemory,
  account,
  privateFilters,
  publicFilters
}) {
  const [open, setOpen] = useState(false);

  const [date, setDate] = useState([moment(match.params.startDate), null]);
  const { t, i18n } = useTranslation();

  const getParams = useCallback(
    forceParams => {
      const params = {
        idSegment: filter.idSegment,
        idDept: filter.idDepartment,
        idDrug: filter.idDrug,
        pending: filter.pending,
        currentDepartment: prioritizationType === 'patient' ? filter.currentDepartment : 0,
        agg: prioritizationType === 'patient' ? 1 : 0,
        concilia: prioritizationType === 'conciliation' ? 1 : 0,
        startDate: date[0] ? date[0].format('YYYY-MM-DD') : 'all',
        endDate: date[1] ? date[1].format('YYYY-MM-DD') : 'all'
      };
      const mixedParams = { ...params, ...forceParams };
      const finalParams = {};

      for (const key in mixedParams) {
        if (mixedParams[key] !== 'all') {
          finalParams[key] = mixedParams[key];
        }
      }

      return finalParams;
    },
    [
      filter.idSegment,
      filter.idDepartment,
      filter.idDrug,
      filter.pending,
      filter.currentDepartment,
      prioritizationType,
      date
    ]
  );

  useEffect(() => {
    if (!isEmpty(segments.error)) {
      message.error(segments.error.message);
    }
  }, [segments.error]);

  useEffect(() => {
    if (filter.idSegment == null) return;

    if (filter.idSegment !== 'all') {
      fetchDepartmentsList(filter.idSegment);
    } else {
      resetDepartmentsLst();
    }
  }, [filter.idSegment, fetchDepartmentsList, resetDepartmentsLst]);

  // update list status
  const updateStatus = useCallback(() => {
    if (segments.list.length === 0) return;

    updatePrescriptionListStatus(getParams());
  }, [segments, updatePrescriptionListStatus, getParams]);

  useEffect(() => {
    window.addEventListener('focus', updateStatus);

    return () => {
      window.removeEventListener('focus', updateStatus);
    };
  }, [updateStatus]);

  const loadFilter = filterData => {
    fetchPrescriptionsList(getParams({ ...filterData, idDept: filterData.idDepartment }));
    if (!isEmpty(filterData.idDrug)) {
      searchDrugs(filterData.idSegment, { idDrug: filterData.idDrug });
    }
    setOpen(false);
  };

  const onDepartmentChange = idDept => {
    setScreeningListFilter({ idDepartment: idDept });
  };

  const onCurrentDepartmentChange = e => {
    setScreeningListFilter({ currentDepartment: e.target.checked ? 1 : 0 });
  };

  const onDrugChange = idDrug => {
    setScreeningListFilter({ idDrug });
  };

  const onPendingChange = pending => {
    setScreeningListFilter({ pending: pending ? 1 : 0 });
  };

  const onDateChange = dt => {
    setDate(dt);
  };

  useEffect(() => {
    if (!filter.idSegment && segments.list.length) {
      setScreeningListFilter({ idSegment: segments.list[0].id });
      fetchPrescriptionsList(getParams({ idSegment: segments.list[0].id }));
    }
  }, [segments.list, filter.idSegment, setScreeningListFilter, fetchPrescriptionsList, getParams]);

  useEffect(() => {
    if (filter.idSegment) {
      fetchPrescriptionsList(getParams());
    }

    if (!isEmpty(filter.idDrug) && filter.idSegment) {
      searchDrugs(filter.idSegment, { idDrug: filter.idDrug });
    }
  }, []); // eslint-disable-line

  const disabledDate = current => {
    if (hasPeriodLimit) {
      return current < subDays(new Date(), 8) || current > new Date();
    }

    return false;
  };

  const search = () => {
    fetchPrescriptionsList(getParams());
    setOpen(false);
  };

  const reset = () => {
    setScreeningListFilter({
      idSegment: segments.list[0].id,
      idDepartment: [],
      idDrug: [],
      pending: 0
    });
    setDate([moment(), null]);
  };

  const countHiddenFilters = filters => {
    const skip = ['idSegment', 'agg'];
    let count = 0;

    Object.keys(filters).forEach(key => {
      if (skip.indexOf(key) !== -1) return;

      if (!isEmpty(filter[key]) || filter[key] === true || filter[key] === 1) {
        count++;
      }
    });

    return count;
  };

  const searchDrugsAutocomplete = debounce(value => {
    if (value.length < 3) return;
    searchDrugs(filter.idSegment, { q: value });
  }, 800);

  const hiddenFieldCount = countHiddenFilters(filter);
  return (
    <SearchBox className={open ? 'open' : ''}>
      <Row gutter={[16, 16]} type="flex">
        <Col md={8}>
          <Box>
            <Heading as="label" htmlFor="segments" size="14px">
              {t('screeningList.segment')}:
            </Heading>
            <Select
              id="segments"
              style={{ width: '100%' }}
              loading={segments.isFetching}
              onChange={idSegment => setScreeningListFilter({ idSegment, idDepartment: [] })}
              value={filter.idSegment}
            >
              {segments.list.map(({ id, description: text }) => (
                <Select.Option key={id} value={id}>
                  {text}
                </Select.Option>
              ))}
            </Select>
          </Box>
        </Col>
        <Col md={7} lg={7} xxl={5}>
          <Box>
            <Heading as="label" htmlFor="date" size="14px">
              {t('screeningList.date')}:
            </Heading>
            <RangeDatePicker
              format="DD/MM/YYYY"
              disabledDate={disabledDate}
              value={date}
              onChange={onDateChange}
              dropdownClassName="noArrow"
              allowClear={false}
              language={i18n.language}
            />
          </Box>
        </Col>
        <Col md={4}>
          <div style={{ display: 'flex' }}>
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

            <Tooltip title={t('screeningList.search')}>
              <Button
                type="secondary gtm-btn-search"
                shape="circle"
                icon="search"
                onClick={search}
                size="large"
                style={{ marginTop: '7px' }}
                loading={isFetchingPrescription}
              />
            </Tooltip>
            <Tooltip title={t('screeningList.resetFilter')}>
              <Button
                className="gtm-btn-reset"
                shape="circle"
                icon="delete"
                onClick={reset}
                style={{ marginTop: '11px', marginLeft: '5px' }}
                loading={isFetchingPrescription}
              />
            </Tooltip>
            <FilterMemory
              fetchMemory={fetchMemory}
              account={account}
              savedFilters={savedFilters}
              publicFilters={publicFilters}
              privateFilters={privateFilters}
              saveMemory={saveMemory}
              filter={filter}
              setScreeningListFilter={setScreeningListFilter}
              loadFilter={loadFilter}
            />
          </div>
        </Col>
      </Row>
      <Row gutter={[20, 20]}>
        <Col md={24} xl={18} xxl={14}>
          <Row gutter={[20, 20]}>
            <Col>
              <Box>
                <Row gutter={0} style={{ width: '100%' }}>
                  <Col md={prioritizationType === 'patient' ? 19 : 24}>
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
                      value={filter.idDepartment}
                      onChange={onDepartmentChange}
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
                  {prioritizationType === 'patient' && (
                    <Col md={5}>
                      <Checkbox
                        style={{ marginTop: '17px', marginLeft: '10px' }}
                        checked={filter.currentDepartment}
                        onChange={onCurrentDepartmentChange}
                        id="gtm-currentDepartment-filter"
                      >
                        <Tooltip title={t('screeningList.labelCurrentDepartmentHint')} underline>
                          {t('screeningList.labelCurrentDepartment')}
                        </Tooltip>
                      </Checkbox>
                    </Col>
                  )}
                </Row>
              </Box>
            </Col>
          </Row>

          <Row gutter={[20, 0]} style={{ marginTop: '10px' }}>
            <Col>
              <Box>
                <Heading as="label" htmlFor="drugs-filter" size="14px">
                  {t('screeningList.labelDrug')}:
                </Heading>
                <Select
                  id="drugs-filter"
                  mode="multiple"
                  optionFilterProp="children"
                  style={{ width: '100%' }}
                  placeholder={t('screeningList.labelDrugPlaceholder')}
                  onChange={onDrugChange}
                  value={filter.idDrug}
                  notFoundContent={drugs.isFetching ? <LoadBox /> : null}
                  filterOption={false}
                  allowClear
                  onSearch={searchDrugsAutocomplete}
                >
                  {drugs.list.map(({ idDrug, name }) => (
                    <Select.Option key={idDrug} value={idDrug}>
                      {name}
                    </Select.Option>
                  ))}
                </Select>
              </Box>
            </Col>
          </Row>

          <Row gutter={[20, 0]} style={{ marginTop: '20px' }}>
            <Col>
              <Box flexDirection="row" alignItems="center">
                <Heading as="label" htmlFor="pending-filter" size="14px">
                  {t('screeningList.labelPendingPrescription')}
                </Heading>

                <Switch
                  style={{ marginLeft: '10px' }}
                  onChange={onPendingChange}
                  checked={filter.pending === 1}
                  id="gtm-pending-filter"
                />
              </Box>
            </Col>
          </Row>
          <Row gutter={20} style={{ marginTop: '10px' }}>
            <Col>
              <div className="search-box-buttons">
                <Button type="nda gtm-bt-clear-filter" onClick={reset}>
                  {t('screeningList.resetFilter')}
                </Button>
                <Button
                  type="secondary gtm-bt-search-filter"
                  onClick={search}
                  loading={isFetchingPrescription}
                >
                  {t('screeningList.search')}
                </Button>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </SearchBox>
  );
}
