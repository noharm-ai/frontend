import React, { useState } from 'react';

import { ExpandableTable } from '@components/Table';
import Empty from '@components/Empty';

import columnsTable, { expandedRowRender, solutionColumns, dietColumns } from '../../columns';
import { rowClassName } from '../PrescriptionDrugList';

function Table({ hasFilter, filter, bag, isFetching, emptyMessage, ds, listType }) {
  const [expandedRows, setExpandedRows] = useState([]);

  const updateExpandedRows = (list, key) => {
    if (list.includes(key)) {
      return list.filter(i => i !== key);
    }

    return [...list, key];
  };

  const handleRowExpand = record => {
    setExpandedRows(updateExpandedRows(expandedRows, record.key));
  };

  const extraBag = {
    ...bag,
    handleRowExpand
  };

  const getColumns = () => {
    switch (listType) {
      case 'solution':
        return solutionColumns(extraBag);
      case 'diet':
        return dietColumns(extraBag);
      default:
        return columnsTable(hasFilter ? filter : { status: null }, extraBag);
    }
  };

  return (
    <ExpandableTable
      columns={getColumns()}
      pagination={false}
      loading={isFetching}
      locale={{
        emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyMessage} />
      }}
      dataSource={!isFetching ? ds.value : []}
      expandedRowRender={expandedRowRender(extraBag)}
      rowClassName={rowClassName}
      expandedRowKeys={expandedRows}
      onExpand={(expanded, record) => handleRowExpand(record)}
    />
  );
}

export default Table;
