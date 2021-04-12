import React, { useEffect, useState } from 'react';

import { Row, Col } from '@components/Grid';
import { Select } from '@components/Inputs';
import Heading from '@components/Heading';
import notification from '@components/notification';
import Button from '@components/Button';
import Icon from '@components/Icon';
import Tooltip from '@components/Tooltip';

import FormSubstance from '@containers/Forms/Substance';

const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description:
    'Aconteceu algo que nos impediu de salvar os dados deste medicamento. Por favor, tente novamente.'
};

const saveMessage = {
  message: 'Uhu! Substância alterada com sucesso! :)'
};

const formId = 'editSubstance';

export default function EditSubstance({
  drugData,
  fetchSubstances,
  substance,
  saveDrug,
  saveStatus,
  idDrug,
  updateDrugData,
  security,
  selectSubstance,
  fetchRelations
}) {
  const [isFormVisible, setFormVisibility] = useState(false);
  const [currentSubstance, setCurrentSubstance] = useState({});
  const { isSaving, error, success } = saveStatus;

  useEffect(() => {
    fetchSubstances();
  }, [fetchSubstances]);

  useEffect(() => {
    setCurrentSubstance({ sctidA: drugData.sctidA, sctNameA: drugData.sctNameA });
  }, [drugData.sctNameA, drugData.sctidA]);

  useEffect(() => {
    if (success === formId) {
      notification.success(saveMessage);
    }

    if (error) {
      notification.error(errorMessage);
    }
  }, [success, error, fetchRelations]);

  const onCancelForm = () => {
    setFormVisibility(false);
  };

  const afterSaveForm = () => {
    setFormVisibility(false);
  };

  const changeSubstance = value => {
    setCurrentSubstance({ sctidA: value.key, sctNameA: value.label });

    fetchRelations(value.key);
  };

  const saveSubstance = () => {
    const { sctidA, sctNameA } = currentSubstance;

    updateDrugData({
      sctidA,
      sctNameA
    });

    saveDrug({
      id: idDrug,
      sctid: sctidA,
      formId
    });
  };

  const edit = () => {
    selectSubstance({
      sctid: drugData.sctidA,
      name: drugData.sctNameA
    });
    setFormVisibility(true);
  };
  const add = () => {
    selectSubstance({
      isAdd: true
    });
    setFormVisibility(true);
  };

  return (
    <>
      <Row type="flex" gutter={24} align="middle">
        <Col md={7} xxl={4}>
          <Heading as="h3" size="16px" textAlign="right">
            Substância:
          </Heading>
        </Col>
        <Col md={24 - 7} xxl={24 - 4}>
          <Select
            id="sctidA"
            labelInValue
            style={{ width: '70%' }}
            showSearch
            optionFilterProp="children"
            placeholder="Selecione a substância..."
            value={{ key: currentSubstance.sctidA || '' }}
            loading={substance.isFetching}
            disabled={isSaving}
            onChange={changeSubstance}
          >
            <Select.Option key="0" value="0">
              &nbsp;
            </Select.Option>
            {substance.list.map(({ sctid, name }) => (
              <Select.Option key={sctid} value={sctid}>
                {name}
              </Select.Option>
            ))}
          </Select>
          {drugData.sctidA !== currentSubstance.sctidA && (
            <Tooltip title="Confirmar e Salvar a alteração">
              <Button
                type="primary gtm-bt-change-substancia"
                style={{ marginLeft: '5px' }}
                onClick={saveSubstance}
                disabled={isSaving}
                loading={isSaving}
              >
                <Icon type="check" />
              </Button>
            </Tooltip>
          )}
          {security.isAdmin() && drugData.sctidA === currentSubstance.sctidA && (
            <>
              <Tooltip title="Editar substância">
                <Button
                  type="primary gtm-bt-edit-substancia"
                  style={{ marginLeft: '5px' }}
                  onClick={edit}
                >
                  <Icon type="form" />
                </Button>
              </Tooltip>
              <Tooltip title="Adicionar substância">
                <Button
                  type="primary gtm-bt-add-substancia"
                  style={{ marginLeft: '5px' }}
                  onClick={add}
                >
                  <Icon type="plus" />
                </Button>
              </Tooltip>
            </>
          )}
        </Col>
      </Row>
      <FormSubstance
        visible={isFormVisible}
        onCancel={onCancelForm}
        okText="Salvar"
        okType="primary gtm-bt-save-substance"
        cancelText="Cancelar"
        afterSave={afterSaveForm}
      />
    </>
  );
}
