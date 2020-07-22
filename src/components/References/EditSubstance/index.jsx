import React, { useEffect } from 'react';

import { Row, Col } from '@components/Grid';
import { Select } from '@components/Inputs';
import Heading from '@components/Heading';
import notification from '@components/notification';

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
  security
}) {
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
  }, [success, error]);

  const saveSubstance = value => {
    updateDrugData({
      sctidA: value
    });

    saveDrug({
      id: idDrug,
      sctid: value,
      formId
    });
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
            <Select
              id="sctidA"
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="children"
              placeholder="Selecione a substância..."
              value={drugData.sctidA || ''}
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
          )}
          {!security.isAdmin() && (
            <Heading as="h3" size="16px">
              {drugData.sctNameA}
            </Heading>
          )}
        </Col>
      </Row>
    </>
  );
}
