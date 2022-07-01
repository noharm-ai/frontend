import 'styled-components/macro';
import React, { useEffect } from 'react';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash.debounce';
import uniqBy from 'lodash.uniqby';

import { Col, Row } from '@components/Grid';
import { Select, InputNumber, Textarea } from '@components/Inputs';
import Heading from '@components/Heading';
import LoadBox from '@components/LoadBox';

import { Box, FieldError, FormHeader } from '../Form.style';

export default function Base({ item, fetchDrugSummary, searchDrugs, drugs, drugSummary }) {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const { t } = useTranslation();
  const {
    idPrescriptionDrug,
    idDrug,
    idSegment,
    idHospital,
    dose,
    measureUnit,
    frequency,
    interval,
    route,
    recommendation
  } = values;
  const layout = { label: 8, input: 16 };

  const search = debounce(value => {
    if (value.length < 3) return;
    searchDrugs(idSegment, { q: value });
  }, 800);

  const handleDrugChange = (value, option) => {
    setFieldValue('idDrug', value);
    setFieldValue('idDrugLabel', option.props.children);

    setFieldValue('dose', null);
    setFieldValue('frequency', null);
    setFieldValue('measureUnit', null);
    setFieldValue('route', null);
    setFieldValue('interval', null);
  };

  const handleMeasureUnitChange = (value, option) => {
    setFieldValue('measureUnit', value);
    setFieldValue('measureUnitLabel', option.props.children);
  };

  const handleFrequencyChange = (value, option) => {
    setFieldValue('frequency', value);
    setFieldValue('frequencyLabel', option.props.children);

    setFieldValue('interval', '');
  };

  const handleIntervalChange = (value, option) => {
    setFieldValue('interval', value);
  };

  useEffect(() => {
    if (idDrug) {
      fetchDrugSummary(idDrug, idSegment, idHospital);
    }
  }, [fetchDrugSummary, idDrug, idSegment, idHospital]);

  const { units, routes, frequencies, intervals } = drugSummary.data ? drugSummary.data : {};
  const currentDrug = { idDrug: item.idDrug, name: item.drug };
  const drugList = item.idDrug ? uniqBy(drugs.list.concat([currentDrug]), 'idDrug') : drugs.list;
  const editIntervalAndRoute = false;

  return (
    <>
      {idPrescriptionDrug && (
        <FormHeader>
          <Row type="flex" gutter={24} css="padding: 2px 0">
            <Col xs={layout.label}>
              <Heading as="p" size="14px">
                {t('tableHeader.drug')}:
              </Heading>
            </Col>
            <Col xs={layout.input}>{currentDrug.name}</Col>
          </Row>
        </FormHeader>
      )}

      {!idPrescriptionDrug && (
        <Box hasError={errors.idDrug && touched.idDrug}>
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
              notFoundContent={drugs.isFetching ? <LoadBox /> : 'Nenhum resultado encontrado'}
              loading={drugs.isFetching}
              filterOption={false}
              onSearch={search}
              onChange={(value, option) => handleDrugChange(value, option)}
              autoFocus
            >
              {!drugs.isFetching &&
                drugList.map(({ idDrug, name }) => (
                  <Select.Option key={idDrug} value={idDrug}>
                    {name}
                  </Select.Option>
                ))}
            </Select>
            {errors.idDrug && touched.idDrug && <FieldError>{errors.idDrug}</FieldError>}
          </Col>
        </Box>
      )}

      {idDrug && (drugSummary.isFetching || !drugSummary.data) ? (
        <div style={{ width: '100%' }}>
          <LoadBox />
        </div>
      ) : (
        idDrug && (
          <>
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
                  showSearch
                  style={{ width: '100%' }}
                  value={measureUnit}
                  onChange={(value, option) => handleMeasureUnitChange(value, option)}
                >
                  {uniqBy(units, 'id').map(({ id, description }) => (
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
                  showSearch
                  style={{ width: '100%' }}
                  placeholder=""
                  value={frequency}
                  onChange={(value, option) => handleFrequencyChange(value, option)}
                >
                  {uniqBy(frequencies, 'id').map(({ id, description }) => (
                    <Select.Option key={id} value={id}>
                      {description}
                    </Select.Option>
                  ))}
                </Select>
                {errors.frequency && touched.frequency && (
                  <FieldError>{errors.frequency}</FieldError>
                )}
              </Col>
            </Box>

            {editIntervalAndRoute && (
              <>
                <Box hasError={errors.interval && touched.interval}>
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
                      {intervals
                        .filter(i => i.idFrequency === values.frequency)
                        .map(({ id, description }) => (
                          <Select.Option key={id} value={id}>
                            {description}
                          </Select.Option>
                        ))}
                    </Select>
                    {errors.interval && touched.interval && (
                      <FieldError>{errors.interval}</FieldError>
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
              </>
            )}

            <Box hasError={errors.recommendation && touched.recommendation}>
              <Col xs={layout.label}>
                <Heading as="label" size="14px">
                  {t('tableHeader.medicalObservation')}:
                </Heading>
              </Col>
              <Col xs={layout.input}>
                <Textarea
                  value={recommendation}
                  onChange={({ target }) => setFieldValue('recommendation', target.value)}
                  style={{ minHeight: '150px' }}
                  maxLength={1950}
                />
                {errors.recommendation && touched.recommendation && (
                  <FieldError>{errors.recommendation}</FieldError>
                )}
              </Col>
            </Box>
          </>
        )
      )}
    </>
  );
}
