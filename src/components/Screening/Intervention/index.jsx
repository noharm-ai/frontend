import 'styled-components/macro';
import React, { useEffect } from 'react';
import isEmpty from 'lodash.isempty';
import uniqBy from 'lodash.uniqby';
import debounce from 'lodash.debounce';

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
      <Col span={24 - 8}>{frequency && `${frequency.value} ${frequency.label}`}</Col>
    </Row>
    <Row type="flex" gutter={24} css="padding: 2px 0">
      <Col span={8}>
        <Heading as="p" size="14px">
          Via:
        </Heading>
      </Col>
      <Col span={24 - 8}>{route}</Col>
    </Row>
  </Box>
);

const Reason = ({ reasons, defaultReason, updateReason }) => {
  const joinReasons = (ids, reasons) => {
    if (isEmpty(ids)) return '';

    const selectedReasons = ids.map(id => {
      const index = reasons.findIndex(item => item.id === id);
      return reasons[index].description;
    });

    return selectedReasons.join(', ');
  };

  const handleChange = idInterventionReason => {
    const reasonDescription = joinReasons(idInterventionReason, reasons.list);
    if (!hasRelationships(reasons.list, idInterventionReason)) {
      updateReason({ idInterventionReason, interactions: null, reasonDescription });
    } else {
      updateReason({ idInterventionReason, reasonDescription });
    }
  };

  return (
    <Box css="display: flex; align-items: center">
      <Heading as="label" htmlFor="reason" size="14px" className="fixed">
        <Tooltip title="Apresentação, Substituição, Interações, Incompatibilidades ou Duplicidade abrem a opção de informar os medicamentos relacionados">
          Motivos: *
        </Tooltip>
      </Heading>
      <Select
        id="reason"
        mode="multiple"
        optionFilterProp="children"
        style={{ width: '80%' }}
        placeholder="Selecione os motivos..."
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

const Interactions = ({
  interactions,
  interactionsList,
  updateInteractions,
  drugs,
  searchDrugs,
  idSegment,
  uniqueDrugList
}) => {
  const handleChange = interactions => {
    if (!isEmpty(interactions)) {
      interactions = interactions.map(item => parseInt(item, 10));
    }

    const list = drugs.list
      .concat(interactionsList)
      .map(i => {
        if (interactions.indexOf(parseInt(i.idDrug, 10)) !== -1) {
          i.idDrug = i.idDrug + '';
          return i;
        }

        return null;
      })
      .filter(i => i != null);

    updateInteractions({ interactions, interactionsList: list });
  };

  const search = debounce(value => {
    if (value.length < 3) return;
    searchDrugs(idSegment, { q: value });
  }, 800);

  if (!isEmpty(interactions)) {
    interactions = interactions.map(item => item + '');
  }

  interactionsList = interactionsList ? interactionsList : [];
  uniqueDrugList = uniqueDrugList ? uniqueDrugList : [];
  const normalizedList = drugs.list
    .concat(interactionsList)
    .concat(uniqueDrugList)
    .map(i => {
      i.idDrug = i.idDrug + '';
      return i;
    });

  return (
    <Box css="display: flex; align-items: center">
      <Heading as="label" htmlFor="interactions" size="14px" className="fixed">
        <Tooltip title="Lista de medicamentos com Interações, Incompatibilidades, Duplicidade, Substituições e diferentes formas de apresentação">
          Relações:
        </Tooltip>
      </Heading>

      <Select
        id="interactions"
        mode="multiple"
        optionFilterProp="children"
        style={{ width: '80%' }}
        placeholder="Selecione as relações..."
        onChange={handleChange}
        defaultValue={interactions || undefined}
        notFoundContent={drugs.isFetching ? <LoadBox /> : null}
        filterOption={false}
        onSearch={search}
      >
        {uniqBy(normalizedList, 'idDrug').map(({ idDrug, name }) => (
          <Select.Option key={idDrug} value={idDrug}>
            {name}
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
        <Editor
          onEdit={onEdit}
          content={content || ''}
          onInit={editor => {
            editor.editing.view.focus();
          }}
        />
      </EditorBox>
    </Box>
  );
};

const hasRelationships = (reasonList, selectedReasons = []) => {
  if (!selectedReasons) return false;

  const reasonsWithRelationshipsRegEx = /duplicidade|interaç|incompatib|apresentaç|substituiç/g;
  let hasRelationships = false;

  selectedReasons.forEach(itemId => {
    const reasonIndex = reasonList.findIndex(reason => reason.id === itemId);

    if (reasonIndex !== -1) {
      const reason = reasonList[reasonIndex].description.toLowerCase();
      if (reason.match(reasonsWithRelationshipsRegEx)) {
        hasRelationships = true;
      }
    }
  });

  return hasRelationships;
};

export default function Intervention({
  intervention,
  fetchReasonsList,
  updateSelectedItemToSaveIntervention,
  drugs,
  searchDrugs
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
          interactions={itemToSave.intervention.interactions}
          interactionsList={itemToSave.intervention.interactionsList}
          updateInteractions={updateSelectedItemToSaveIntervention}
          searchDrugs={searchDrugs}
          idSegment={itemToSave.intervention.idSegment || itemToSave.idSegment}
          drugs={drugs}
          uniqueDrugList={itemToSave.uniqueDrugList}
        />
      )}

      <Observations
        content={!isEmpty(itemToSave) && itemToSave.intervention.observation}
        onEditObservation={updateSelectedItemToSaveIntervention}
      />
    </>
  );
}
