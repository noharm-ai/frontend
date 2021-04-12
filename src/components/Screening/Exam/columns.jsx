import React from 'react';
import { format } from 'date-fns';

import ValuedExams from './ValuedExams';
import TextualExams from './TextualExams';

const columns = [
  {
    title: 'Exame',
    dataIndex: 'name',
    align: 'left'
  },
  {
    title: 'Percentual',
    dataIndex: 'perc',
    align: 'center'
  },
  {
    title: 'Valor',
    align: 'center',
    render: (text, record) => {
      if (record.text) {
        return '--';
      }
      return `${record.value} ${record.unit}`;
    }
  },
  {
    title: 'Referência',
    dataIndex: 'ref',
    align: 'left'
  },
  {
    title: 'Data',
    align: 'center',
    render: (text, record) => {
      return format(new Date(record.date), 'dd/MM/yyyy HH:mm');
    }
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
  if (record.text) {
    return <TextualExams record={record} />;
  }

  return <ValuedExams record={record} />;
};
