import React, { useState } from "react";

import { ExpandableTable } from "components/Table";
import Empty from "components/Empty";

import columnsTable, {
  expandedRowRender,
  solutionColumns,
  dietColumns,
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
        return solutionColumns(extraBag);
      case "diet":
        return dietColumns(extraBag);
      default:
        return columnsTable(hasFilter ? filter : { status: null }, extraBag);
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
      rowClassName={rowClassName}
      expandedRowKeys={expandedRows}
      onExpand={(expanded, record) => handleRowExpand(record)}
      columnTitle={<ExpandColumn expand={!expandedRows.length} />}
    />
  );
}

export default Table;
