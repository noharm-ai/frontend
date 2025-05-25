import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { uniq } from "utils/lodash";

import { ExpandableTable } from "components/Table";
import Empty from "components/Empty";
import {
  toggleSelectedRows,
  setSelectedRows,
} from "features/prescription/PrescriptionSlice";

import columnsTable, {
  expandedRowRender,
  solutionColumns,
  dietColumns,
  alertsPerspectiveColumns,
} from "../../columns";
import { rowClassName } from "../PrescriptionDrugList";
import { getResponsiveTableWidth } from "src/utils/responsive";

function Table({
  hasFilter,
  filter,
  bag,
  isFetching,
  emptyMessage,
  ds,
  listType,
  showHeader,
}) {
  const dispatch = useDispatch();
  const prescriptionListType = useSelector(
    (state) => state.preferences.prescription.listType
  );
  const prescriptionDrugOrder = useSelector(
    (state) => state.preferences.prescription.drugOrder
  );
  const prescriptionPerspective = useSelector(
    (state) => state.prescriptionv2.perspective
  );
  const selectedRows = useSelector(
    (state) => state.prescriptionv2.selectedRows.list
  );
  const selectedRowsActive = useSelector(
    (state) => state.prescriptionv2.selectedRows.active
  );
  const [expandedRows, setExpandedRows] = useState([]);

  const updateExpandedRows = (list, key) => {
    if (list.includes(key)) {
      return list.filter((i) => i !== key);
    }

    return [...list, key];
  };

  const handleRowExpand = (record) => {
    setExpandedRows(updateExpandedRows(expandedRows, record.key));
  };

  const toggleExpansion = () => {
    if (expandedRows.length) {
      setExpandedRows([]);
    } else {
      if (ds.value) {
        setExpandedRows(
          ds.value.filter((i) => /^[0-9]*$/g.test(i.key)).map((i) => i.key)
        );
      }
    }
  };

  const selectAllRows = () => {
    let rows = ds.value || [];
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
    let rows = ds.value || [];
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

  const extraBag = {
    ...bag,
    handleRowExpand,
    dispatch,
    selectedRows,
    toggleSelectedRows,
    selectedRowsActive,
    selectAllRows,
    isAllSelected: isAllSelected(),
    prescriptionDrugOrder: prescriptionDrugOrder,
  };

  const getColumns = () => {
    switch (listType) {
      case "solution":
        return prescriptionPerspective === "default"
          ? solutionColumns(extraBag)
          : alertsPerspectiveColumns(extraBag);
      case "diet":
        return dietColumns(extraBag);
      default:
        return prescriptionPerspective === "default"
          ? columnsTable(hasFilter ? filter : { status: null }, extraBag)
          : alertsPerspectiveColumns(extraBag);
    }
  };

  const ExpandColumn = ({ expand }) => {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          type="button"
          className={`expand-all ant-table-row-expand-icon ${
            expand ? "ant-table-row-expand-icon-collapsed" : ""
          }`}
          onClick={toggleExpansion}
        ></button>
      </div>
    );
  };

  return (
    <ExpandableTable
      showHeader={showHeader}
      columns={getColumns()}
      pagination={false}
      loading={isFetching}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={emptyMessage}
          />
        ),
      }}
      dataSource={!isFetching ? [...(ds.value || [])] : []}
      expandedRowRender={expandedRowRender(extraBag)}
      rowClassName={(record) => rowClassName(record, extraBag)}
      expandedRowKeys={expandedRows}
      onExpand={(expanded, record) => handleRowExpand(record)}
      columnTitle={<ExpandColumn expand={!expandedRows.length} />}
      className={prescriptionListType}
      scroll={getResponsiveTableWidth("1300px")}
    />
  );
}

export default Table;
