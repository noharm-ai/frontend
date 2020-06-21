import React, { useEffect, useState } from 'react';
import isEmpty from 'lodash.isempty';
import { Row } from 'antd';

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
import PopConfirm from '@components/PopConfirm';
import Icon from '@components/Icon';

import Edit from '@containers/References/Edit';
import Relation from '@containers/References/Relation';
import Filter from './Filter';
import columns from './columns';
import unitConversionColumns from './UnitConversion/columns';
import relationsColumns from './Relation/columns';

import DrugForm from '@containers/Forms/Drug';

// empty text for table result.
const emptyText = (
  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum dado encontrado." />
);
// error message when fetch has error.
const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description: 'Aconteceu algo que nos impediu de lhe mostrar os dados, por favor, tente novamente.'
};
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
  ...restProps
}) {
  const { isFetching, list, error, generateStatus, drugData, saveRelation } = outliers;
  const [obsModalVisible, setObsModalVisibility] = useState(false);
  const [relationModalVisible, setRelationModalVisibility] = useState(false);
  const isAdmin = security.isAdmin();

  const [title] = useMedia([`(max-width: ${breakpoints.lg})`], [[theTitle]], [noop]);
  const {
    drugs: { units }
  } = restProps;

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
  const unitsDatasource = toDataSource(units.list, 'idMeasureUnit', {
    saveUnitCoefficient,
    idDrug: outliers.selecteds.idDrug,
    isAdmin
  });
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
      notification.error(errorMessage);
    }
  }, [error]);

  useEffect(() => {
    if (!isEmpty(generateStatus.error)) {
      notification.error({ message: 'Ops! Algo de errado aconteceu ao gerar os outliers.' });
    }
  }, [generateStatus.error]);

  useEffect(() => {
    if (generateStatus.generated) {
      generateOutlierReset();

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

      restProps.fetchDrugsUnitsList({ id: outliers.selecteds.idDrug });
    }
  }, [
    generateStatus.generated,
    generateOutlierReset,
    match.params,
    fetchReferencesList,
    restProps,
    outliers.selecteds.idDrug
  ]);

  useEffect(() => {
    if (outliers.saveStatus.success) {
      notification.success(saveObsMessage);
      setObsModalVisibility(false);
    }

    if (outliers.saveStatus.error) {
      notification.error(errorMessage);
    }
  }, [outliers.saveStatus.success, outliers.saveStatus.error]);

  useEffect(() => {
    if (saveRelation.success) {
      notification.success({ message: 'Uhu! Relação salva com sucesso.' });
      setRelationModalVisibility(false);
    }

    if (saveRelation.error) {
      notification.error(errorMessage);
    }
  }, [saveRelation.success, saveRelation.error]);

  const convFreq = frequency => {
    switch (frequency) {
      case '33':
        return 'SN';
      case '44':
        return 'ACM';
      case '99':
        return 'N/D';
      default:
        return frequency;
    }
  };

  const rowClassName = (record, index) => {
    if (
      record.dose + '' === match.params.dose &&
      record.frequency + '' === convFreq(match.params.frequency)
    ) {
      return 'highlight';
    }
  };

  const generate = () => {
    generateOutlier({ idSegment: outliers.selecteds.idSegment, idDrug: outliers.selecteds.idDrug });
  };

  return (
    <>
      <Filter {...restProps} outliers={outliers} />
      <Tabs defaultActiveKey="1" style={{ width: '100%', marginTop: '20px' }} type="card">
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
              Conversão de unidades:
            </Heading>
          </FieldSet>
          <Table
            columns={unitConversionColumns}
            pagination={false}
            loading={units.isFetching}
            locale={{ emptyText }}
            dataSource={!units.isFetching ? unitsDatasource : []}
          />
          {isAdmin && (
            <PopConfirm
              title="Ao gerar novos outliers os escores manuais serão perdidos. Deseja continuar?"
              onConfirm={generate}
              okText="Sim"
              cancelText="Não"
            >
              <Button
                type="primary"
                style={{ marginTop: '10px' }}
                loading={generateStatus.isGenerating}
              >
                Gerar Outlier
              </Button>
            </PopConfirm>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Atributos" key="2">
          <DrugForm fetchReferencesList={fetchReferencesList} match={match} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Relações" key="3">
          <Row type="flex" justify="end">
            <Button type="primary gtm-bt-add-relation" onClick={addRelationModal}>
              <Icon type="plus" /> Adicionar
            </Button>
          </Row>
          <Table
            title={title}
            columns={relationsColumns}
            pagination={false}
            loading={isFetching}
            locale={{ emptyText }}
            dataSource={!isFetching ? dsRelations : []}
          />
        </Tabs.TabPane>
      </Tabs>

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
