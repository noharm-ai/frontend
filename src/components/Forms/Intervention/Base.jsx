import 'styled-components/macro';
import React from 'react';
import isEmpty from 'lodash.isempty';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';

import { Col } from '@components/Grid';
import { Select } from '@components/Inputs';
import Heading from '@components/Heading';
import Tooltip from '@components/Tooltip';
import Switch from '@components/Switch';

import Interaction from './Fields/Interaction';
import Observation from './Fields/Observation';

import { Box, FieldError, InternalBox } from '../Form.style';

export default function Base({
  intervention,
  reasons,
  searchDrugs,
  drugs,
  reasonTextMemory,
  memorySaveReasonText,
  memoryFetchReasonText
}) {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const { t } = useTranslation();
  const { item: itemToSave } = intervention;
  const { error, cost, idInterventionReason, interactions, observation } = values;
  const layout = { label: 8, input: 16 };

  const hasRelationships = (reasonList, selectedReasons = []) => {
    if (!selectedReasons) return false;

    const reasonsWithRelationshipsRegEx = /duplicidade|interaç|incompatib|apresentaç|forma|subst/g;

    return hasReason(reasonList, selectedReasons, reasonsWithRelationshipsRegEx);
  };

  const hasTranscription = (reasonList, selectedReasons = []) => {
    if (!selectedReasons) return false;

    const reasonsWithTranscription = /proto/g;

    return hasReason(reasonList, selectedReasons, reasonsWithTranscription);
  };

  const hasReason = (reasonList, selectedReasons = [], regex) => {
    if (!selectedReasons) return false;

    let hasRelation = false;

    selectedReasons.forEach(itemId => {
      const reasonIndex = reasonList.findIndex(reason => reason.id === itemId);

      if (reasonIndex !== -1) {
        const reason = reasonList[reasonIndex].description.toLowerCase();
        if (reason.match(regex)) {
          hasRelation = true;
        }
      }
    });

    return hasRelation;
  };

  const handleReasonChange = idInterventionReason => {
    const joinReasons = (ids, reasons) => {
      if (isEmpty(ids)) return '';

      const selectedReasons = ids.map(id => {
        const index = reasons.findIndex(item => item.id === id);
        return reasons[index].description;
      });

      return selectedReasons.join(', ');
    };
    const reasonDescription = joinReasons(idInterventionReason, reasons.list);
    if (!hasRelationships(reasons.list, idInterventionReason)) {
      setFieldValue('idInterventionReason', idInterventionReason);
      setFieldValue('interactions', null);
      setFieldValue('reasonDescription', reasonDescription);
    } else {
      setFieldValue('idInterventionReason', idInterventionReason);
      setFieldValue('reasonDescription', reasonDescription);
    }
  };

  return (
    <>
      <Box hasError={errors.error && touched.error}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px">
            <Tooltip title={t('interventionForm.labelPrescriptionErrorHint')} underline>
              {t('interventionForm.labelPrescriptionError')}:
            </Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Switch onChange={value => setFieldValue('error', value)} checked={error} />
          {errors.error && touched.error && <FieldError>{errors.error}</FieldError>}
        </Col>
      </Box>

      <Box hasError={errors.cost && touched.cost}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px">
            <Tooltip title={t('interventionForm.labelCostReductionHint')} underline>
              {t('interventionForm.labelCostReduction')}:
            </Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Switch onChange={value => setFieldValue('cost', value)} checked={cost} />
          {errors.cost && touched.cost && <FieldError>{errors.cost}</FieldError>}
        </Col>
      </Box>

      <Box hasError={errors.idInterventionReason && touched.idInterventionReason}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px">
            <Tooltip title={t('interventionForm.labelReasonsHint')} underline>
              {t('interventionForm.labelReasons')}:
            </Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Select
            id="reason"
            mode="multiple"
            optionFilterProp="children"
            style={{ width: '100%' }}
            placeholder={t('interventionForm.labelReasonsPlaceholder')}
            loading={reasons.isFetching}
            value={idInterventionReason}
            onChange={handleReasonChange}
          >
            {reasons.list.map(({ id, description }) => (
              <Select.Option key={id} value={id}>
                {description}
              </Select.Option>
            ))}
          </Select>
          {errors.idInterventionReason && touched.idInterventionReason && (
            <FieldError>{errors.idInterventionReason}</FieldError>
          )}
        </Col>
      </Box>
      {hasRelationships(reasons.list, idInterventionReason) && (
        <Box hasError={errors.interactions && touched.interactions}>
          <Col xs={layout.label}>
            <Heading as="label" size="14px">
              <Tooltip title={t('interventionForm.labelRelationsHint')} underline>
                {t('interventionForm.labelRelations')}:
              </Tooltip>
            </Heading>
          </Col>
          <Col xs={layout.input}>
            <Interaction
              interactions={interactions}
              interactionsList={itemToSave.intervention.interactionsList}
              setFieldValue={setFieldValue}
              searchDrugs={searchDrugs}
              idSegment={itemToSave.intervention.idSegment || itemToSave.idSegment}
              drugs={drugs}
              uniqueDrugList={itemToSave.uniqueDrugList}
            />
            {errors.interactions && touched.interactions && (
              <FieldError>{errors.interactions}</FieldError>
            )}
          </Col>
        </Box>
      )}
      {hasTranscription(reasons.list, idInterventionReason) && (
        <>
          <Heading as="label" size="14px" style={{ marginLeft: '8px', marginTop: '10px' }}>
            Transcrição
          </Heading>
          <InternalBox>
            <Box hasError={errors.interactions && touched.interactions}>
              <Col xs={layout.label}>
                <Heading as="label" size="14px">
                  Dose:
                </Heading>
              </Col>
              <Col xs={layout.input}>
                <Select
                  id="dose"
                  optionFilterProp="children"
                  style={{ width: '100%' }}
                  placeholder=""
                >
                  <Select.Option key="1" value="1">
                    Teste
                  </Select.Option>
                </Select>
                {errors.interactions && touched.interactions && (
                  <FieldError>{errors.interactions}</FieldError>
                )}
              </Col>
            </Box>
            <Box hasError={errors.interactions && touched.interactions}>
              <Col xs={layout.label}>
                <Heading as="label" size="14px">
                  Unidade:
                </Heading>
              </Col>
              <Col xs={layout.input}>
                <Select
                  id="measureUnit"
                  optionFilterProp="children"
                  style={{ width: '100%' }}
                  placeholder=""
                >
                  <Select.Option key="1" value="1">
                    Teste
                  </Select.Option>
                </Select>
                {errors.interactions && touched.interactions && (
                  <FieldError>{errors.interactions}</FieldError>
                )}
              </Col>
            </Box>
            <Box hasError={errors.interactions && touched.interactions}>
              <Col xs={layout.label}>
                <Heading as="label" size="14px">
                  Via:
                </Heading>
              </Col>
              <Col xs={layout.input}>
                <Select
                  id="route"
                  optionFilterProp="children"
                  style={{ width: '100%' }}
                  placeholder=""
                >
                  <Select.Option key="1" value="1">
                    Teste
                  </Select.Option>
                </Select>
                {errors.interactions && touched.interactions && (
                  <FieldError>{errors.interactions}</FieldError>
                )}
              </Col>
            </Box>
            <Box hasError={errors.interactions && touched.interactions}>
              <Col xs={layout.label}>
                <Heading as="label" size="14px">
                  Frequência:
                </Heading>
              </Col>
              <Col xs={layout.input}>
                <Select
                  id="frequency"
                  optionFilterProp="children"
                  style={{ width: '100%' }}
                  placeholder=""
                >
                  <Select.Option key="1" value="1">
                    Teste
                  </Select.Option>
                </Select>
                {errors.interactions && touched.interactions && (
                  <FieldError>{errors.interactions}</FieldError>
                )}
              </Col>
            </Box>
          </InternalBox>
        </>
      )}
      <Box hasError={errors.observation && touched.observation}>
        <Observation
          content={observation}
          setFieldValue={setFieldValue}
          memory={reasonTextMemory}
          fetchMemory={memoryFetchReasonText}
          saveMemory={memorySaveReasonText}
          currentReason={idInterventionReason}
        />
        {errors.observation && touched.observation && <FieldError>{errors.observation}</FieldError>}
      </Box>
    </>
  );
}
