import React, { useState } from "react";
import isEmpty from "lodash.isempty";
import { useTranslation } from "react-i18next";

import LoadBox from "components/LoadBox";
import Table from "components/Table";
import Empty from "components/Empty";

import FormIntervention from "containers/Forms/Intervention";

import { conciliationColumns } from "../Screening/columns";
import { rowClassName } from "../Screening/PrescriptionDrug/PrescriptionDrugList";

import { BoxWrapper } from "./index.style";

export default function PrescriptionDrugList({
  isFetching,
  dataSource,
  saveInterventionStatus,
  checkIntervention,
  admissionNumber,
  checkPrescriptionDrug,
  idSegment,
  select,
  selectPrescriptionDrug,
  updatePrescriptionDrugData,
  uniqueDrugs,
  currentPrescription,
  security,
}) {
  const [openIntervention, setOpenIntervention] = useState(false);
  const { t } = useTranslation();

  if (isFetching) {
    return <LoadBox />;
  }

  const onShowModal = (data) => {
    select(data);
    setOpenIntervention(true);
  };

  const bag = {
    concilia: true,
    onShowModal,
    selectPrescriptionDrug,
    check: checkPrescriptionDrug,
    updatePrescriptionDrugData,
    idSegment,
    admissionNumber,
    saveInterventionStatus,
    checkIntervention,
    uniqueDrugList: uniqueDrugs,
    currentPrescription,
    security,
    t,
  };

  const filteredDataSource = () => {
    if (isEmpty(dataSource)) {
      return [];
    }

    return dataSource[0].value.filter((i) => {
      return !i.suspended;
    });
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
          ),
        }}
        dataSource={filteredDataSource()}
        rowClassName={rowClassName}
      />
      <FormIntervention
        open={openIntervention}
        setVisibility={setOpenIntervention}
        checkPrescriptionDrug={checkPrescriptionDrug}
      />
    </BoxWrapper>
  );
}
