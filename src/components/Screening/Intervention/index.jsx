import 'styled-components/macro';
import React, { useEffect } from 'react';
import isEmpty from 'lodash.isempty';

import { Row, Col } from '@components/Grid';
import { Select } from '@components/Inputs';
import Heading from '@components/Heading';
import Editor from '@components/Editor';
import Switch from '@components/Switch';

import { Box } from './Intervention.style';

const Drug = ({ drug, dosage, frequency, route, score }) => (
  <Box>
    <Row type="flex" gutter={24} css="padding: 7px 0">
      <Col span={8}>
        <Heading as="p" size="14px">
          Medicamento:
        </Heading>
      </Col>
      <Col span={24 - 8}>{drug}</Col>
    </Row>
    <Row type="flex" gutter={24} css="padding: 7px 0">
      <Col span={8}>
        <Heading as="p" size="14px">
          Dose:
        </Heading>
      </Col>
      <Col span={24 - 8}>{dosage}</Col>
    </Row>
    <Row type="flex" gutter={24} css="padding: 7px 0">
      <Col span={8}>
        <Heading as="p" size="14px">
          Frequência:
        </Heading>
      </Col>
      <Col span={24 - 8}>{frequency}</Col>
    </Row>
    <Row type="flex" gutter={24} css="padding: 7px 0">
      <Col span={8}>
        <Heading as="p" size="14px">
          Via:
        </Heading>
      </Col>
      <Col span={24 - 8}>{route}</Col>
    </Row>
    <Row type="flex" gutter={24} css="padding: 7px 0">
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
    updateReason({ idInterventionReason });
  };

  return (
    <Box css="align-items: center;display: flex;">
      <Heading as="label" htmlFor="reason" size="14px" margin="0 10px 0 0">
        Motivo:
      </Heading>
      <Select
        id="reason"
        style={{ width: '100%' }}
        placeholder="Selectione um motivo..."
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

const Propagation = ({ handleChangePropagation, defaultChecked }) => {
  const handleChange = isChecked => {
    handleChangePropagation({ propagation: isChecked ? 'S' : 'N' });
  };

  return (
    <Box css="align-items: center;display: flex;">
      <Heading as="label" htmlFor="reason" size="14px" margin="0 10px 0 0">
        Propagar:
      </Heading>
      <Switch onChange={handleChange} defaultChecked={defaultChecked} />
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
      <Editor onEdit={onEdit} content={content || ''} />
    </Box>
  );
};

export default function Intervention({
  intervention,
  fetchReasonsList,
  updateSelectedItemToSaveIntervention
}) {
  useEffect(() => {
    fetchReasonsList();
  }, [fetchReasonsList]);

  const { maybeCreateOrUpdate } = intervention;
  const { item: itemToSave } = maybeCreateOrUpdate;

  return (
    <>
      <header>
        <Heading margin="0 0 11px">Intervenção</Heading>
      </header>
      <Drug {...itemToSave} />
      <Reason
        reasons={intervention.reasons}
        defaultReason={!isEmpty(itemToSave) && itemToSave.intervention.idInterventionReason}
        updateReason={updateSelectedItemToSaveIntervention}
      />
      <Propagation
        handleChangePropagation={updateSelectedItemToSaveIntervention}
        defaultChecked={!isEmpty(itemToSave) && itemToSave.intervention.propagation === 'S'}
      />
      <Observations
        content={!isEmpty(itemToSave) && itemToSave.intervention.observation}
        onEditObservation={updateSelectedItemToSaveIntervention}
      />
    </>
  );
}
