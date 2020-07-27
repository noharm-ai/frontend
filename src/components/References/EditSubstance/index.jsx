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
  const { isSaving, error, success } = saveStatus;

  useEffect(() => {
    fetchSubstances();
  }, [fetchSubstances]);

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

  const saveSubstance = value => {
    updateDrugData({
      sctidA: value.key,
      sctNameA: value.label
    });

    saveDrug({
      id: idDrug,
      sctid: value.key,
      formId
    });

    fetchRelations(value.key);
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
          {security.isAdmin() && (
            <>
              <Select
                id="sctidA"
                labelInValue
                style={{ width: '70%' }}
                showSearch
                optionFilterProp="children"
                placeholder="Selecione a substância..."
                value={{ key: drugData.sctidA || '' }}
                loading={substance.isFetching}
                disabled={isSaving}
                onChange={saveSubstance}
              >
                {substance.list.map(({ sctid, name }) => (
                  <Select.Option key={sctid} value={sctid}>
                    {name}
                  </Select.Option>
                ))}
              </Select>
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
          {!security.isAdmin() && (
            <Heading as="h3" size="16px">
              {drugData.sctNameA}
            </Heading>
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
