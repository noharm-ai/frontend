import React, { useState } from "react";
import { useSelector } from "react-redux";

import { ExpandableTable } from "components/Table";
import Empty from "components/Empty";

import columnsTable, {
  expandedRowRender,
  solutionColumns,
  dietColumns,
  alertsPerspectiveColumns,
} from "../../columns";
import { rowClassName } from "../PrescriptionDrugList";

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
  const prescriptionListType = useSelector(
    (state) => state.preferences.prescription.listType
  );
  const prescriptionPerspective = useSelector(
    (state) => state.prescriptionv2.perspective
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
      setExpandedRows(
        ds.value.filter((i) => /^[0-9]*$/g.test(i.key)).map((i) => i.key)
      );
    }
  };

  const extraBag = {
    ...bag,
    handleRowExpand,
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
      rowClassName={(record) => rowClassName(record, bag)}
      expandedRowKeys={expandedRows}
      onExpand={(expanded, record) => handleRowExpand(record)}
      columnTitle={<ExpandColumn expand={!expandedRows.length} />}
      className={prescriptionListType}
    />
  );
}

export default Table;
