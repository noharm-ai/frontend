import React from 'react';

import { toDataSource } from '@utils';
import Table, { NestedTableContainer } from '@components/Table';
import Empty from '@components/Empty';

const columns = [
  {
    title: 'Exame',
    dataIndex: 'name',
    align: 'left'
  },
  {
    title: 'Data',
    dataIndex: 'date',
    align: 'center'
  },
  {
    title: 'Percentual',
    dataIndex: 'perc',
    align: 'center'
  },
  {
    title: 'Valor',
    dataIndex: 'value',
    align: 'center'
  },
  {
    title: 'Referência',
    dataIndex: 'ref',
    align: 'left'
  }
];

export default columns;

export const examRowClassName = record => {
  if (record.alert) {
    return 'danger';
  }

  return '';
};

export const expandedExamRowRender = record => {
  const expandedColumns = [
    {
      title: 'Histórico de exames',
      align: 'left',
      children: [
        {
          title: 'Valor',
          dataIndex: 'value',
          align: 'center'
        },
        {
          title: 'Data',
          dataIndex: 'date',
          align: 'center'
        }
      ]
    }
  ];

  const history = record.history.map((item, index) => ({ ...item, key: index }));

  const dsHistory = toDataSource(history, 'key');

  return (
    <NestedTableContainer>
      <Table
        columns={expandedColumns}
        pagination={false}
        locale={{
          emptyText: (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum exame encontrado." />
          )
        }}
        dataSource={dsHistory}
        rowClassName={examRowClassName}
      />
    </NestedTableContainer>
  );
};
