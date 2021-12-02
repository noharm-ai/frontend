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
  const { dose, frequency, route, measureUnit, idDrugTranscription } = values;

  useEffect(() => {
    fetchDrugSummary(idDrugTranscription, drugData.idSegment);
  }, [fetchDrugSummary, idDrugTranscription, drugData.idSegment]);

  if (drugSummary.isFetching || !drugSummary.data) {
    return (
      <div style={{ width: '100%' }}>
        <LoadBox />
      </div>
    );
  }

  const handleDrugChange = (value, option) => {
    setFieldValue('idDrugTranscription', value);
    setFieldValue('drugLabel', option.props.children);

    setFieldValue('dose', null);
    setFieldValue('frequency', null);
    setFieldValue('measureUnit', null);
    setFieldValue('route', null);

    console.log('option', option);
  };

  const { units, routes, frequencies, drug } = drugSummary.data;
  const search = debounce(value => {
    if (value.length < 3) return;
    searchDrugs(drugData.idSegment, { q: value });
  }, 800);
  const currentDrug = { idDrug: drug.id, name: drug.name };

  return (
    <InternalBox>
      <Box hasError={errors.idDrugTranscription && touched.idDrugTranscription}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px">
            {t('tableHeader.drug')}:
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Select
            id="idDrugTranscription"
            showSearch
            optionFilterProp="children"
            style={{ width: '100%' }}
            defaultValue={idDrugTranscription || undefined}
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
          {errors.idDrugTranscription && touched.idDrugTranscription && (
            <FieldError>{errors.idDrugTranscription}</FieldError>
          )}
        </Col>
      </Box>
      <Box hasError={errors.dose && touched.dose}>
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
            onChange={value => setFieldValue('dose', value)}
          />
          {errors.dose && touched.dose && <FieldError>{errors.dose}</FieldError>}
        </Col>
      </Box>
      <Box hasError={errors.measureUnit && touched.measureUnit}>
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
            onChange={value => setFieldValue('measureUnit', value)}
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
      <Box hasError={errors.route && touched.route}>
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
            onChange={value => setFieldValue('route', value)}
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
      <Box hasError={errors.frequency && touched.frequency}>
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
            onChange={value => setFieldValue('frequency', value)}
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
    </InternalBox>
  );
}
