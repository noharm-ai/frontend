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
import Button from '@components/Button';
import notification from '@components/notification';

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
        <Tooltip
          title="Apresentação, Substituição, Interações, Incompatibilidades ou Duplicidade abrem a opção de informar os medicamentos relacionados"
          underline
        >
          Motivos:
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
        <Tooltip
          title="Erro de prescrição com significado clínico é definido como um erro de decisão, não intencional, que pode reduzir a probabilidade do tratamento ser efetivo ou aumentar o risco de lesão no paciente, quando comparado com as praticas clínicas estabelecidas e aceitas. Ref: CFF,  Prot.: MS e Anvisa"
          underline
        >
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
        <Tooltip title="Esta intervenção gera redução de custo?" underline>
          Reduz custo:
        </Tooltip>
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
        <Tooltip
          title="Lista de medicamentos com Interações, Incompatibilidades, Duplicidade, Substituições e/ou diferentes formas de apresentação"
          underline
        >
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

const Observations = ({
  content,
  onEditObservation,
  memory,
  fetchMemory,
  saveMemory,
  currentReason
}) => {
  const isMemoryDisabled = currentReason == null || currentReason.length !== 1;

  useEffect(() => {
    if (!isMemoryDisabled) {
      fetchMemory(`reasonsDefaultText-${currentReason[0]}`);
    }
  }, [fetchMemory, currentReason, isMemoryDisabled]);

  useEffect(() => {
    if (memory.save.success) {
      notification.success({ message: 'Uhu! Observação modelo salva com sucesso!' });
    }
  }, [memory.save.success]);

  const saveDefaultText = () => {
    const payload = {
      type: `reasonsDefaultText-${currentReason[0]}`,
      value: { text: content }
    };

    if (!isEmpty(memory.list)) {
      payload.id = memory.list[0].key;
    }
    saveMemory(payload);
  };

  const loadDefaultText = () => {
    onEditObservation({ observation: memory.list[0].value.text });
    notification.success({ message: 'Observação modelo aplicada com sucesso!' });
  };

  const onEdit = observation => {
    onEditObservation({ observation });
  };

  const getMemoryTooltip = () => {
    const config = { save: 'Salvar observação modelo', apply: 'Aplicar observação modelo' };

    if (currentReason && currentReason.length > 1) {
      const msg =
        'Modelos: Esta funcionalidade é desabilitada quando múltiplos motivos são selecionados';
      return {
        save: msg,
        apply: msg
      };
    }

    if (isMemoryDisabled) {
      const msg = 'Modelos: Selecione um motivo para liberar esta funcionalidade';
      return {
        save: msg,
        apply: msg
      };
    }

    if (isEmpty(memory.list) || !content) {
      return {
        save: content ? config.save : 'Preencha o texto para salvar como modelo',
        apply: !isEmpty(memory.list) ? config.apply : 'Este motivo ainda não possui um modelo salvo'
      };
    }

    return config;
  };

  const memoryTooltip = getMemoryTooltip();

  return (
    <Box>
      <Row>
        <Col xs={20}>
          <Heading as="h4" htmlFor="reason" size="14px" margin="0 0 14px">
            Observações:
          </Heading>
        </Col>
        <Col xs={4}>
          <div style={{ textAlign: 'right' }}>
            <Tooltip title={memoryTooltip.save}>
              <Button
                shape="circle"
                icon="save"
                loading={memory.isFetching || memory.save.isSaving}
                onClick={saveDefaultText}
                disabled={isMemoryDisabled || !content}
                style={{ marginRight: '5px' }}
                type="nda gtm-bt-interv-mem-save"
              />
            </Tooltip>
            <Tooltip title={memoryTooltip.apply}>
              <Button
                shape="circle"
                icon="download"
                loading={memory.isFetching || memory.save.isSaving}
                onClick={loadDefaultText}
                disabled={isMemoryDisabled || isEmpty(memory.list)}
                type={!isEmpty(memory.list) ? 'primary gtm-bt-interv-mem-apply' : ''}
              />
            </Tooltip>
          </div>
        </Col>
      </Row>
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
  searchDrugs,
  reasonTextMemory,
  memorySaveReasonText,
  memoryFetchReasonText
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
        memory={reasonTextMemory}
        fetchMemory={memoryFetchReasonText}
        saveMemory={memorySaveReasonText}
        currentReason={!isEmpty(itemToSave) && itemToSave.intervention.idInterventionReason}
      />
    </>
  );
}
