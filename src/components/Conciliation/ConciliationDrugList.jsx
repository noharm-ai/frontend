import React from "react";
import { useSelector, useDispatch } from "react-redux";
import isEmpty from "lodash.isempty";
import { useTranslation } from "react-i18next";
import { uniq } from "utils/lodash";

import LoadBox from "components/LoadBox";
import Table from "components/Table";
import Empty from "components/Empty";
import notification from "components/notification";
import DefaultModal from "components/Modal";
import { filterInterventionByPrescriptionDrug } from "utils/transformers/intervention";

import { conciliationColumns } from "../Screening/columns";
import { rowClassName } from "../Screening/PrescriptionDrug/PrescriptionDrugList";
import ChooseInterventionModal from "components/Screening/PrescriptionDrug/components/ChooseInterventionModal";
import expandedRowRender from "./table/expandedRowRender";
import Filters from "components/Screening/PrescriptionDrug/components/Filters";
import {
  toggleSelectedRows,
  setSelectedRows,
} from "features/prescription/PrescriptionSlice";

import { BoxWrapper } from "./index.style";

export default function ConciliationDrugList({
  isFetching,
  dataSource,
  saveIntervention,
  admissionNumber,
  checkPrescriptionDrug,
  idSegment,
  select,
  selectPrescriptionDrug,
  updatePrescriptionDrugData,
  uniqueDrugs,
  currentPrescription,
  security,
  interventions,
  updateInterventionData,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selectedRows = useSelector(
    (state) => state.prescriptionv2.selectedRows.list
  );
  const selectedRowsActive = useSelector(
    (state) => state.prescriptionv2.selectedRows.active
  );

  if (isFetching) {
    return <LoadBox />;
  }

  const selectAllRows = () => {
    let rows = dataSource[0]?.value || [];
    rows = rows
      .filter((i) => /^[0-9]*$/g.test(i.key))
      .map((i) => i.idPrescriptionDrug);

    if (rows.length > 0) {
      if (isAllSelected()) {
        dispatch(
          setSelectedRows(selectedRows.filter((s) => rows.indexOf(s) === -1))
        );
      } else {
        const allRows = [...selectedRows, ...rows];
        dispatch(setSelectedRows(uniq(allRows)));
      }
    }
  };

  const isAllSelected = () => {
    if (!selectedRows.length) return false;

    let selected = true;
    let rows = dataSource[0]?.value || [];
    rows = rows
      .filter((i) => /^[0-9]*$/g.test(i.key))
      .map((i) => i.idPrescriptionDrug);

    rows.forEach((r) => {
      if (selectedRows.indexOf(r) === -1) {
        selected = false;
      }
    });

    return selected;
  };

  const selectIntervention = (int, data) => {
    select({
      ...data,
      intervention: {
        ...int,
      },
    });
  };

  const addMultipleIntervention = (selectedRows) => {
    select({
      intervention: {},
      idPrescriptionDrugList: selectedRows,
      admissionNumber,
      uniqueDrugList: uniqueDrugs,
    });
  };

  const onShowModal = (data) => {
    const intvList = interventions.filter(
      filterInterventionByPrescriptionDrug(data.idPrescriptionDrug)
    );

    if (intvList.length > 0) {
      const modal = DefaultModal.info({
        title: "Intervenções",
        content: null,
        icon: null,
        width: 500,
        okText: "Fechar",
        okButtonProps: { type: "default" },
        wrapClassName: "default-modal",
      });

      modal.update({
        content: (
          <ChooseInterventionModal
            selectIntervention={selectIntervention}
            interventions={intvList}
            completeData={data}
            modalRef={modal}
            translate={t}
          />
        ),
      });
    } else {
      select({
        ...data,
        intervention: {
          nonce: Math.random(),
        },
      });
    }
  };

  const saveInterventionAndUpdateData = (params) => {
    saveIntervention(params)
      .then((response) => {
        updateInterventionData(response.data[0]);
      })
      .catch(() => {
        notification.error({
          message: t("error.title"),
          description: t("error.description"),
        });
      });
  };

  const bag = {
    concilia: true,
    onShowModal,
    saveIntervention: saveInterventionAndUpdateData,
    selectPrescriptionDrug,
    check: checkPrescriptionDrug,
    updatePrescriptionDrugData,
    idSegment,
    admissionNumber,
    uniqueDrugList: uniqueDrugs,
    currentPrescription,
    security,
    t,
    interventions,
    dispatch,
    selectedRows,
    toggleSelectedRows,
    selectedRowsActive,
    selectAllRows,
    isAllSelected: isAllSelected(),
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
      <Filters
        showFilter={false}
        showPerspective={false}
        showVizMode={false}
        showMultipleSelection={true}
        showPrescriptionOrder={false}
        addMultipleIntervention={addMultipleIntervention}
      />
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
        rowClassName={(record) => rowClassName(record, bag)}
        expandedRowRender={expandedRowRender({ t })}
      />
    </BoxWrapper>
  );
}
