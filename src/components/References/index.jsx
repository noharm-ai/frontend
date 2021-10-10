import React, { useEffect, useState } from 'react';
import isEmpty from 'lodash.isempty';
import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';

import breakpoints from '@styles/breakpoints';
import { useMedia } from '@lib/hooks';
import { toDataSource } from '@utils';
import Table from '@components/Table';
import Empty from '@components/Empty';
import notification from '@components/notification';
import Heading from '@components/Heading';
import { FieldSet } from '@components/Inputs';
import DefaultModal from '@components/Modal';
import Tabs from '@components/Tabs';
import Button from '@components/Button';
import Icon from '@components/Icon';
import BackTop from '@components/BackTop';

import Edit from '@containers/References/Edit';
import EditSubstance from '@containers/References/EditSubstance';
import Relation from '@containers/References/Relation';
import ScoreWizard from '@containers/References/ScoreWizard';
import Filter from './Filter';
import columns from './columns';
import relationsColumns from './Relation/columns';

import DrugForm from '@containers/Forms/Drug';

// empty text for table result.
const emptyText = (
  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum dado encontrado." />
);

const saveObsMessage = {
  message: 'Uhu! Outlier atualizado com sucesso! :)'
};
const noop = () => {};
const theTitle = () => 'Deslize para a direita para ver mais conteúdo.';

export default function References({
  match,
  outliers,
  fetchReferencesList,
  saveOutlier,
  saveOutlierRelation,
  saveUnitCoefficient,
  selectOutlier,
  selectOutlierRelation,
  security,
  generateOutlier,
  generateOutlierReset,
  updateDrugData,
  ...restProps
}) {
  const { t } = useTranslation();
  const {
    isFetching,
    list,
    error,
    generateStatus,
    drugData,
    saveRelation,
    relationStatus
  } = outliers;
  const [obsModalVisible, setObsModalVisibility] = useState(false);
  const [relationModalVisible, setRelationModalVisibility] = useState(false);
  const [resetWizard, setResetWizard] = useState(false);

  const [title] = useMedia([`(max-width: ${breakpoints.lg})`], [[theTitle]], [noop]);

  const onSaveObs = () => {
    saveOutlier(outliers.edit.item.idOutlier, { obs: outliers.edit.item.obs });
  };
  const onCancelObs = () => {
    selectOutlier({});
    setObsModalVisibility(false);
  };
  const onShowObsModal = data => {
    selectOutlier(data);
    setObsModalVisibility(true);
  };

  const onSaveRelation = () => {
    saveOutlierRelation({
      ...saveRelation.item,
      new: false
    });
  };
  const onCancelRelation = () => {
    selectOutlierRelation({});
    setRelationModalVisibility(false);
  };
  const onShowRelationModal = data => {
    selectOutlierRelation(data);
    setRelationModalVisibility(true);
  };
  const addRelationModal = () => {
    const data = {
      new: true,
      editable: true,
      active: true,
      sctidA: drugData.sctidA,
      sctNameA: drugData.sctNameA
    };

    onShowRelationModal(data);
  };

  const dataSource = toDataSource(list, 'idOutlier', { saveOutlier, onShowObsModal });
  const dsRelations = toDataSource(drugData.relations, null, {
    showModal: onShowRelationModal,
    relationTypes: drugData.relationTypes,
    sctidA: drugData.sctidA,
    sctNameA: drugData.sctNameA
  });

  useEffect(() => {
    if (!isEmpty(match.params)) {
      fetchReferencesList(
        match.params.idSegment,
        match.params.idDrug,
        match.params.dose,
        match.params.frequency
      );
    } else {
      fetchReferencesList();
    }
  }, [fetchReferencesList, match.params]);

  // show message if has error
  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error({
        message: t('error.title'),
        description: t('error.description')
      });
    }
  }, [error, t]);

  useEffect(() => {
    if (!isEmpty(generateStatus.error)) {
      notification.error({ message: 'Ops! Algo de errado aconteceu ao gerar os outliers.' });
    }
  }, [generateStatus.error]);

  useEffect(() => {
    if (generateStatus.generated) {
      notification.success({ message: 'Escores gerados com sucesso!' });
      generateOutlierReset();
      setResetWizard(true);

      if (!isEmpty(match.params)) {
        fetchReferencesList(
          match.params.idSegment,
          match.params.idDrug,
          match.params.dose,
          match.params.frequency
        );
      } else {
        fetchReferencesList();
      }

      restProps.fetchDrugsUnitsList({
        id: outliers.selecteds.idDrug,
        idSegment: outliers.selecteds.idSegment
      });
    } else {
      setResetWizard(false);
    }
  }, [
    generateStatus.generated,
    generateOutlierReset,
    match.params,
    fetchReferencesList,
    restProps,
    outliers.selecteds.idDrug,
    outliers.selecteds.idSegment
  ]);

  useEffect(() => {
    if (outliers.saveStatus.success) {
      notification.success(saveObsMessage);
      setObsModalVisibility(false);
    }

    if (outliers.saveStatus.error) {
      notification.error({
        message: t('error.title'),
        description: t('error.description')
      });
    }
  }, [outliers.saveStatus.success, outliers.saveStatus.error, t]);

  useEffect(() => {
    if (saveRelation.success) {
      notification.success({ message: 'Uhu! Relação salva com sucesso.' });
      setRelationModalVisibility(false);
    }

    if (saveRelation.error) {
      notification.error({
        message: t('error.title'),
        description: t('error.description')
      });
    }
  }, [saveRelation.success, saveRelation.error, t]);

  const convFreq = frequency => {
    switch (frequency) {
      case '33':
        return 'SN';
      case '44':
        return 'ACM';
      case '55':
        return 'CONT';
      case '66':
        return 'AGORA';
      case '99':
        return 'N/D';
      default:
        return frequency;
    }
  };

  const rowClassName = (record, index) => {
    let matchDose = match.params.dose;
    if (drugData.division) {
      matchDose = Math.ceil(matchDose / drugData.division) * drugData.division;
    }
    if (
      record.dose + '' === matchDose + '' &&
      record.frequency + '' === convFreq(match.params.frequency)
    ) {
      return 'highlight';
    }
  };

  return (
    <>
      <Filter {...restProps} outliers={outliers} />
      <Tabs
        defaultActiveKey="1"
        style={{ width: '100%', marginTop: '20px' }}
        type="card gtm-tab-med"
      >
        <Tabs.TabPane tab="Escores" key="1">
          <Table
            title={title}
            columns={columns}
            pagination={false}
            loading={isFetching}
            locale={{ emptyText }}
            dataSource={!isFetching ? dataSource : []}
            rowClassName={rowClassName}
          />

          <FieldSet style={{ marginBottom: '25px', marginTop: '25px' }}>
            <Heading as="label" size="16px" margin="0 0 10px">
              Assistente para Geração de Escores{' '}
              <span
                style={{
                  color: 'rgba(0, 0, 0, 0.65)',
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '400'
                }}
              >
                Alterações que envolvem a geração de escore
              </span>
            </Heading>
          </FieldSet>

          <ScoreWizard resetWizard={resetWizard} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Atributos" key="2">
          <DrugForm fetchReferencesList={fetchReferencesList} match={match} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Relações" key="3">
          <Row type="flex" justify="end">
            <Col xs={12}>
              <EditSubstance />
            </Col>
            <Col xs={12}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {drugData.sctidA && (
                  <Button type="primary gtm-bt-add-relation" onClick={addRelationModal}>
                    <Icon type="plus" /> Adicionar
                  </Button>
                )}
              </div>
            </Col>
          </Row>
          <Table
            title={title}
            columns={relationsColumns}
            pagination={false}
            loading={isFetching || relationStatus.isFetching}
            locale={{ emptyText }}
            dataSource={!isFetching ? dsRelations : []}
          />
        </Tabs.TabPane>
      </Tabs>

      <BackTop />

      <DefaultModal
        centered
        destroyOnClose
        onOk={onSaveObs}
        visible={obsModalVisible}
        onCancel={onCancelObs}
        confirmLoading={outliers.saveStatus.isSaving}
        okText="Salvar"
        okButtonProps={{
          disabled: outliers.saveStatus.isSaving,
          type: 'primary gtm-bt-save-obs'
        }}
        cancelText="Cancelar"
        cancelButtonProps={{
          disabled: outliers.saveStatus.isSaving,
          type: 'nda gtm-bt-cancel-obs'
        }}
      >
        <Edit />
      </DefaultModal>

      <DefaultModal
        centered
        destroyOnClose
        onOk={onSaveRelation}
        visible={relationModalVisible}
        onCancel={onCancelRelation}
        confirmLoading={saveRelation.isSaving}
        okText="Salvar"
        okButtonProps={{
          disabled:
            saveRelation.isSaving ||
            saveRelation.item.sctidB == null ||
            saveRelation.item.type == null,
          type: 'primary gtm-bt-save-relation'
        }}
        cancelText="Cancelar"
        cancelButtonProps={{
          disabled: saveRelation.isSaving,
          type: 'nda gtm-bt-cancel-relation'
        }}
      >
        <Relation />
      </DefaultModal>
    </>
  );
}
