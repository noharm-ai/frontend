import 'styled-components/macro';
import React, { useEffect } from 'react';
import isEmpty from 'lodash.isempty';

import { Row, Col } from '@components/Grid';
import { Select } from '@components/Inputs';
import Switch from '@components/Switch';
import Heading from '@components/Heading';
import Editor from '@components/Editor';
import LoadBox from '@components/LoadBox';
import Tooltip from '@components/Tooltip';

import { Box, EditorBox } from './Intervention.style';

const Drug = ({ drug, dosage, frequency, route, score }) => (
  <Box>
    <Row type="flex" gutter={24} css="padding: 2px 0">
      <Col span={8}>
        <Heading as="p" size="14px">
          Medicamento:
        </Heading>
      </Col>
      <Col span={24 - 8}>{drug}</Col>
    </Row>
    <Row type="flex" gutter={24} css="padding: 2px 0">
      <Col span={8}>
        <Heading as="p" size="14px">
          Dose:
        </Heading>
      </Col>
      <Col span={24 - 8}>{dosage}</Col>
    </Row>
    <Row type="flex" gutter={24} css="padding: 2px 0">
      <Col span={8}>
        <Heading as="p" size="14px">
          Frequência:
        </Heading>
      </Col>
      <Col span={24 - 8}>
        {frequency.value} {frequency.label}
      </Col>
    </Row>
    <Row type="flex" gutter={24} css="padding: 2px 0">
      <Col span={8}>
        <Heading as="p" size="14px">
          Via:
        </Heading>
      </Col>
      <Col span={24 - 8}>{route}</Col>
    </Row>
    <Row type="flex" gutter={24} css="padding: 2px 0">
      <Col span={8}>
        <Heading as="p" size="14px">
          Escore:
        </Heading>
      </Col>
      <Col span={24 - 8}>{score}</Col>
    </Row>
  </Box>
);

const Reason = ({ reasons, defaultReason, updateReason }) => {
  const handleChange = idInterventionReason => {
    if (!hasRelationships(reasons.list, idInterventionReason)) {
      updateReason({ idInterventionReason, interactions: null });
    } else {
      updateReason({ idInterventionReason });
    }
  };

  return (
    <Box css="display: flex; align-items: center">
      <Heading as="label" htmlFor="reason" size="14px" className="fixed">
        Motivos: *
      </Heading>
      <Select
        id="reason"
        mode="multiple"
        style={{ width: '80%' }}
        placeholder="Selectione os motivos..."
        loading={reasons.isFetching}
        onChange={handleChange}
        defaultValue={defaultReason || undefined}
      >
        {reasons.list.map(({ id, description }) => (
          <Select.Option key={id} value={id}>
            {description}
          </Select.Option>
        ))}
      </Select>
    </Box>
  );
};

const Error = ({ handleChangeError, defaultChecked }) => {
  const handleChange = isChecked => {
    handleChangeError({ error: isChecked });
  };

  return (
    <Box css="align-items: center;display: flex;">
      <Heading
        as="label"
        htmlFor="reason"
        size="14px"
        margin="0 10px 0 0"
        className="fixed"
        style={{ width: '205px' }}
      >
        <Tooltip title="Erro de prescrição com significado clínico é definido como um erro de decisão, não intencional, que pode reduzir a probabilidade do tratamento ser efetivo ou aumentar o risco de lesão no paciente, quando comparado com as praticas clínicas estabelecidas e aceitas. Ref: CFF,  Prot.: MS e Anvisa">
          Possível Erro de prescrição:
        </Tooltip>
      </Heading>
      <Switch onChange={handleChange} defaultChecked={defaultChecked} />
    </Box>
  );
};

const Cost = ({ handleChangeCost, defaultChecked }) => {
  const handleChange = isChecked => {
    handleChangeCost({ cost: isChecked });
  };

  return (
    <Box css="align-items: center;display: flex;">
      <Heading as="label" htmlFor="reason" size="14px" margin="0 10px 0 0" className="fixed">
        <Tooltip title="Esta intervenção gera redução de custo?">Reduz custo:</Tooltip>
      </Heading>
      <Switch onChange={handleChange} defaultChecked={defaultChecked} />
    </Box>
  );
};

const Interactions = ({ uniqueDrugList, interactions, updateInteractions }) => {
  const handleChange = interactions => {
    updateInteractions({ interactions });
  };

  return (
    <Box css="display: flex; align-items: center">
      <Heading as="label" htmlFor="interactions" size="14px" className="fixed">
        <Tooltip title="Lista de medicamentos com Interações, Incompatibilidades ou Duplicidade">
          Relações:
        </Tooltip>
      </Heading>
      <Select
        id="interactions"
        mode="multiple"
        style={{ width: '80%' }}
        placeholder="Selecione as relações..."
        onChange={handleChange}
        defaultValue={interactions || undefined}
      >
        {uniqueDrugList.map(({ idDrug, drug }) => (
          <Select.Option key={idDrug} value={idDrug}>
            {drug}
          </Select.Option>
        ))}
      </Select>
    </Box>
  );
};

const Observations = ({ content, onEditObservation }) => {
  const onEdit = observation => {
    onEditObservation({ observation });
  };

  return (
    <Box>
      <Heading as="h4" htmlFor="reason" size="14px" margin="0 0 14px">
        Observações:
      </Heading>
      <EditorBox>
        <Editor onEdit={onEdit} content={content || ''} />
      </EditorBox>
    </Box>
  );
};

const hasRelationships = (reasonList, selectedReasons = []) => {
  const reasonsWithRelationships = [
    'interações medicamentosas',
    'duplicidade',
    'incompatibilidades'
  ];
  let hasRelationships = false;

  selectedReasons.forEach(itemId => {
    const reasonIndex = reasonList.findIndex(reason => reason.id === itemId);

    if (reasonIndex !== -1) {
      const reason = reasonList[reasonIndex].description.toLowerCase();
      if (reasonsWithRelationships.indexOf(reason) !== -1) {
        hasRelationships = true;
      }
    }
  });

  return hasRelationships;
};

export default function Intervention({
  intervention,
  fetchReasonsList,
  updateSelectedItemToSaveIntervention
}) {
  useEffect(() => {
    fetchReasonsList();
  }, [fetchReasonsList]);

  useEffect(() => {
    updateSelectedItemToSaveIntervention({ status: 's' });
  }, [updateSelectedItemToSaveIntervention]);

  const { maybeCreateOrUpdate } = intervention;
  const { item: itemToSave } = maybeCreateOrUpdate;

  if (isEmpty(itemToSave)) {
    return <LoadBox />;
  }

  return (
    <>
      <header>
        <Heading margin="0 0 11px">Intervenção</Heading>
      </header>
      <Drug {...itemToSave} />
      <Error
        handleChangeError={updateSelectedItemToSaveIntervention}
        defaultChecked={!isEmpty(itemToSave) && itemToSave.intervention.error}
      />
      <Cost
        handleChangeCost={updateSelectedItemToSaveIntervention}
        defaultChecked={!isEmpty(itemToSave) && itemToSave.intervention.cost}
      />
      <Reason
        reasons={intervention.reasons}
        defaultReason={!isEmpty(itemToSave) && itemToSave.intervention.idInterventionReason}
        updateReason={updateSelectedItemToSaveIntervention}
      />
      {hasRelationships(
        intervention.reasons.list,
        itemToSave.intervention.idInterventionReason
      ) && (
        <Interactions
          uniqueDrugList={itemToSave.uniqueDrugList}
          interactions={itemToSave.intervention.interactions}
          updateInteractions={updateSelectedItemToSaveIntervention}
        />
      )}

      <Observations
        content={!isEmpty(itemToSave) && itemToSave.intervention.observation}
        onEditObservation={updateSelectedItemToSaveIntervention}
      />
    </>
  );
}
