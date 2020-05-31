import React, { useEffect, useState } from 'react';
import 'styled-components/macro';
import isEmpty from 'lodash.isempty';

import { toDataSource } from '@utils';
import Empty from '@components/Empty';
import LoadBox from '@components/LoadBox';
import notification from '@components/notification';
import { ExpandableTable } from '@components/Table';
import interventionColumns, {
  expandedInterventionRowRender
} from '@components/Screening/Intervention/columns';
import Modal from '@components/Screening/Modal';

const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description: 'Aconteceu algo que nos impediu de lhe mostrar os dados, por favor, tente novamente.'
};

export default function InterventionList({
  intervention,
  fetchList,
  checkData,
  checkIntervention,
  save,
  reset,
  select,
  updateList
}) {
  const [visible, setVisibility] = useState(false);
  const { isFetching, list, error } = intervention;
  const { isSaving, wasSaved, item } = intervention.maybeCreateOrUpdate;
  const onShowModal = data => {
    select({
      dosage: `${data.dose} ${data.measureUnit.value}`,
      frequency: data.frequency,
      drug: data.drugName,
      route: data.route,
      intervention: data
    });
    setVisibility(true);
  };
  const onSave = () => {
    save(item);
  };
  const onCancel = () => {
    select({});
    setVisibility(false);
  };

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // show message if has error
  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error(errorMessage);
    }
  }, [error]);

  useEffect(() => {
    if (wasSaved) {
      updateList(item);
      reset();
      setVisibility(false);

      notification.success({
        message: 'Uhu! Intervenção salva com sucesso! :)'
      });
    }
  }, [wasSaved, reset, updateList, item]);

  if (isFetching) {
    return <LoadBox />;
  }

  const dsInterventions = toDataSource(list, 'id', {
    check: checkData,
    saveInterventionStatus: checkIntervention,
    onShowModal
  });

  return (
    <>
      <ExpandableTable
        columns={interventionColumns}
        pagination={false}
        loading={isFetching}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Nenhuma intervenção encontrada."
            />
          )
        }}
        dataSource={!isFetching ? dsInterventions : []}
        expandedRowRender={expandedInterventionRowRender}
      />
      <Modal
        onOk={onSave}
        visible={visible}
        onCancel={onCancel}
        confirmLoading={isSaving}
        okButtonProps={{
          disabled: isSaving
        }}
        cancelButtonProps={{
          disabled: isSaving,
          className: 'gtm-bt-cancel-interv'
        }}
        okText="Salvar"
        okType="primary gtm-bt-save-interv"
        cancelText="Cancelar"
      />
    </>
  );
}
