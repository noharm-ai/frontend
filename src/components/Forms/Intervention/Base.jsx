import 'styled-components/macro';
import React from 'react';
import isEmpty from 'lodash.isempty';
import { useFormikContext } from 'formik';

import { Col } from '@components/Grid';
import { Textarea, Select } from '@components/Inputs';
import Heading from '@components/Heading';
import Tooltip from '@components/Tooltip';
import Switch from '@components/Switch';

import PatientData from './PatientData';
import DrugData from './DrugData';
import Interaction from './Fields/Interaction';

import { Box, EditorBox, FieldError } from '../Form.style';

export default function Base({ intervention, reasons, searchDrugs, drugs }) {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const { item: itemToSave } = intervention;
  const { error, cost, idInterventionReason } = values;
  const layout = { label: 8, input: 16 };

  console.log('reasons', reasons);

  const hasRelationships = (reasonList, selectedReasons = []) => {
    if (!selectedReasons) return false;

    const reasonsWithRelationshipsRegEx = /duplicidade|interaç|incompatib|apresentaç|forma|subst/g;
    let hasRelation = false;

    selectedReasons.forEach(itemId => {
      const reasonIndex = reasonList.findIndex(reason => reason.id === itemId);

      if (reasonIndex !== -1) {
        const reason = reasonList[reasonIndex].description.toLowerCase();
        if (reason.match(reasonsWithRelationshipsRegEx)) {
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
      {(itemToSave.intervention.id === 0 || itemToSave.intervention.idPrescriptionDrug === 0) && (
        <PatientData {...itemToSave} />
      )}
      {itemToSave.intervention.id !== 0 && itemToSave.intervention.idPrescriptionDrug !== 0 && (
        <DrugData {...itemToSave} />
      )}
      <Box hasError={errors.error && touched.error}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px">
            <Tooltip
              title="Erro de prescrição com significado clínico é definido como um erro de decisão, não intencional, que pode reduzir a probabilidade do tratamento ser efetivo ou aumentar o risco de lesão no paciente, quando comparado com as praticas clínicas estabelecidas e aceitas. Ref: CFF,  Prot.: MS e Anvisa"
              underline
            >
              Possível Erro de prescrição:
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
            <Tooltip title="Esta intervenção gera redução de custo?" underline>
              Reduz custo:
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
            <Tooltip
              title="Interações, Incompatibilidades, Duplicidade e/ou Forma Farmacêutica abrem a opção de informar os medicamentos relacionados"
              underline
            >
              Motivos:
            </Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Select
            id="reason"
            mode="multiple"
            optionFilterProp="children"
            style={{ width: '80%' }}
            placeholder="Selecione os motivos..."
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
        <Box hasError={errors.idInterventionReason && touched.idInterventionReason}>
          <Col xs={layout.label}>
            <Heading as="label" size="14px">
              <Tooltip
                title="Lista de medicamentos com Interações, Incompatibilidades, Duplicidade e/ou Forma Farmacêutica"
                underline
              >
                Relações:
              </Tooltip>
            </Heading>
          </Col>
          <Col xs={layout.input}>
            <Interaction
              interactions={itemToSave.intervention.interactions}
              interactionsList={itemToSave.intervention.interactionsList}
              setFieldValue={setFieldValue}
              searchDrugs={searchDrugs}
              idSegment={itemToSave.intervention.idSegment || itemToSave.idSegment}
              drugs={drugs}
              uniqueDrugList={itemToSave.uniqueDrugList}
            />
          </Col>
        </Box>
      )}
    </>
  );
}
