import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash.debounce';
import uniqBy from 'lodash.uniqby';

import { Select, InputNumber } from '@components/Inputs';
import { Col } from '@components/Grid';
import Heading from '@components/Heading';
import LoadBox from '@components/LoadBox';

import { Box, FieldError, InternalBox } from '../../Form.style';

export default function Transcription({
  fetchDrugSummary,
  drugSummary,
  drugData,
  setFieldValue,
  layout,
  errors,
  touched,
  values,
  drugs,
  searchDrugs
}) {
  const { t } = useTranslation();
  const { dose, frequency, route, measureUnit, idDrug, interval } = values.transcriptionData;

  useEffect(() => {
    fetchDrugSummary(idDrug, drugData.idSegment);
  }, [fetchDrugSummary, idDrug, drugData.idSegment]);

  if (drugSummary.isFetching || !drugSummary.data) {
    return (
      <div style={{ width: '100%' }}>
        <LoadBox />
      </div>
    );
  }

  const handleDrugChange = (value, option) => {
    setFieldValue('transcriptionData.idDrug', value);
    setFieldValue('transcriptionData.idDrugLabel', option.props.children);

    setFieldValue('transcriptionData.dose', null);
    setFieldValue('transcriptionData.frequency', null);
    setFieldValue('transcriptionData.measureUnit', null);
    setFieldValue('transcriptionData.route', null);
    setFieldValue('transcriptionData.interval', null);
  };

  const handleFrequencyChange = (value, option) => {
    setFieldValue('transcriptionData.frequency', value);
    setFieldValue('transcriptionData.frequencyLabel', option.props.children);
  };

  const handleMeasureUnitChange = (value, option) => {
    setFieldValue('transcriptionData.measureUnit', value);
    setFieldValue('transcriptionData.measureUnitLabel', option.props.children);
  };

  const handleIntervalChange = (value, option) => {
    setFieldValue('transcriptionData.interval', value);
    setFieldValue('transcriptionData.intervalLabel', option.props.children);
  };

  const { units, routes, frequencies, drug, intervals } = drugSummary.data;
  const search = debounce(value => {
    if (value.length < 3) return;
    searchDrugs(drugData.idSegment, { q: value });
  }, 800);
  const currentDrug = { idDrug: drug.id, name: drug.name };

  return (
    <InternalBox>
      <Box
        hasError={errors.idDrug && touched.idDrug}
        className={drugData.idDrug !== idDrug ? 'highlight' : ''}
      >
        <Col xs={layout.label}>
          <Heading as="label" size="14px">
            {t('tableHeader.drug')}:
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Select
            id="idDrug"
            showSearch
            optionFilterProp="children"
            style={{ width: '100%' }}
            defaultValue={idDrug || undefined}
            notFoundContent={drugs.isFetching ? <LoadBox /> : null}
            filterOption={false}
            onSearch={search}
            onChange={(value, option) => handleDrugChange(value, option)}
          >
            {!drugs.isFetching &&
              uniqBy(drugs.list.concat([currentDrug]), 'idDrug').map(({ idDrug, name }) => (
                <Select.Option key={idDrug} value={idDrug}>
                  {name}
                </Select.Option>
              ))}
          </Select>
          {errors.idDrug && touched.idDrug && <FieldError>{errors.idDrug}</FieldError>}
        </Col>
      </Box>
      <Box
        hasError={errors.dose && touched.dose}
        className={drugData.dose !== dose ? 'highlight' : ''}
      >
        <Col xs={layout.label}>
          <Heading as="label" size="14px">
            {t('tableHeader.dose')}:
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <InputNumber
            id="dose"
            style={{ width: 'min(100%, 115px)' }}
            value={dose}
            onChange={value => setFieldValue('transcriptionData.dose', value)}
          />
          {errors.dose && touched.dose && <FieldError>{errors.dose}</FieldError>}
        </Col>
      </Box>
      <Box
        hasError={errors.measureUnit && touched.measureUnit}
        className={
          drugData.measureUnit && drugData.measureUnit.value !== measureUnit ? 'highlight' : ''
        }
      >
        <Col xs={layout.label}>
          <Heading as="label" size="14px">
            {t('tableHeader.measureUnit')}:
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Select
            id="measureUnit"
            optionFilterProp="children"
            style={{ width: '100%' }}
            value={measureUnit}
            onChange={(value, option) => handleMeasureUnitChange(value, option)}
          >
            {units.map(({ id, description }) => (
              <Select.Option key={id} value={id}>
                {description}
              </Select.Option>
            ))}
          </Select>
          {errors.measureUnit && touched.measureUnit && (
            <FieldError>{errors.measureUnit}</FieldError>
          )}
        </Col>
      </Box>
      <Box
        hasError={errors.frequency && touched.frequency}
        className={drugData.frequency && drugData.frequency.value !== frequency ? 'highlight' : ''}
      >
        <Col xs={layout.label}>
          <Heading as="label" size="14px">
            {t('tableHeader.frequency')}:
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Select
            id="frequency"
            optionFilterProp="children"
            style={{ width: '100%' }}
            placeholder=""
            value={frequency}
            onChange={(value, option) => handleFrequencyChange(value, option)}
          >
            {frequencies.map(({ id, description }) => (
              <Select.Option key={id} value={id}>
                {description}
              </Select.Option>
            ))}
          </Select>
          {errors.frequency && touched.frequency && <FieldError>{errors.frequency}</FieldError>}
        </Col>
      </Box>
      <Box
        hasError={errors.interval && touched.interval}
        className={drugData.interval !== interval ? 'highlight' : ''}
      >
        <Col xs={layout.label}>
          <Heading as="label" size="14px">
            {t('tableHeader.interval')}:
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Select
            id="interval"
            optionFilterProp="children"
            style={{ width: '100%' }}
            value={interval}
            onChange={(value, option) => handleIntervalChange(value, option)}
          >
            {intervals.map(({ id, description }) => (
              <Select.Option key={id} value={id}>
                {description}
              </Select.Option>
            ))}
          </Select>
          {errors.interval && touched.interval && <FieldError>{errors.interval}</FieldError>}
        </Col>
      </Box>
      <Box
        hasError={errors.route && touched.route}
        className={drugData.route !== route ? 'highlight' : ''}
      >
        <Col xs={layout.label}>
          <Heading as="label" size="14px">
            {t('tableHeader.route')}:
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Select
            id="route"
            optionFilterProp="children"
            style={{ width: '100%' }}
            value={route}
            onChange={value => setFieldValue('transcriptionData.route', value)}
          >
            {routes.map(({ id, description }) => (
              <Select.Option key={id} value={id}>
                {description}
              </Select.Option>
            ))}
          </Select>
          {errors.route && touched.route && <FieldError>{errors.route}</FieldError>}
        </Col>
      </Box>
    </InternalBox>
  );
}
