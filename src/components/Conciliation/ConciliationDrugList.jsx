import React, { useState } from 'react';
import isEmpty from 'lodash.isempty';

import LoadBox from '@components/LoadBox';
import Table from '@components/Table';
import Empty from '@components/Empty';

import ModalIntervention from '@containers/Screening/ModalIntervention';
import ModalPrescriptionDrug from '@containers/Screening/ModalPrescriptionDrug';

import { conciliationColumns } from '../Screening/columns';
import { rowClassName } from '../Screening/PrescriptionDrug/PrescriptionDrugList';

import { BoxWrapper } from './index.style';

export default function PrescriptionDrugList({
  isFetching,
  dataSource,
  saveInterventionStatus,
  checkIntervention,
  admissionNumber,
  checkPrescriptionDrug,
  savePrescriptionDrugStatus,
  idSegment,
  select,
  selectPrescriptionDrug,
  uniqueDrugs
}) {
  const [openIntervention, setOpenIntervention] = useState(false);
  const [openPrescriptionDrugModal, setOpenPrescriptionDrugModal] = useState(false);

  if (isFetching) {
    return <LoadBox />;
  }

  const onShowModal = data => {
    select(data);
    setOpenIntervention(true);
  };

  const onShowPrescriptionDrugModal = data => {
    selectPrescriptionDrug(data);
    setOpenPrescriptionDrugModal(true);
  };

  const bag = {
    onShowModal,
    onShowPrescriptionDrugModal,
    check: checkPrescriptionDrug,
    savePrescriptionDrugStatus,
    idSegment,
    admissionNumber,
    saveInterventionStatus,
    checkIntervention,
    uniqueDrugList: uniqueDrugs
  };

  return (
    <BoxWrapper>
      <Table
        columns={conciliationColumns(bag)}
        pagination={false}
        loading={isFetching}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Nenhum medicamento encontrado."
            />
          )
        }}
        dataSource={!isEmpty(dataSource) ? dataSource[0].value : []}
        rowClassName={rowClassName}
      />
      <ModalIntervention
        visible={openIntervention}
        setVisibility={setOpenIntervention}
        checkPrescriptionDrug={checkPrescriptionDrug}
      />
      <ModalPrescriptionDrug
        visible={openPrescriptionDrugModal}
        setVisibility={setOpenPrescriptionDrugModal}
      />
    </BoxWrapper>
  );
}
