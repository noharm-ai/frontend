import React from 'react';
import { format } from 'date-fns';

import ValuedExams from './ValuedExams';
import TextualExams from './TextualExams';

export default t => {
  return [
    {
      title: t('tableHeader.exam'),
      dataIndex: 'name',
      align: 'left'
    },
    {
      title: t('tableHeader.percentage'),
      dataIndex: 'perc',
      align: 'center'
    },
    {
      title: t('tableHeader.value'),
      align: 'center',
      render: (text, record) => {
        if (record.text) {
          return '--';
        }
        return `${record.value} ${record.unit}`;
      }
    },
    {
      title: t('tableHeader.reference'),
      dataIndex: 'ref',
      align: 'left'
    },
    {
      title: t('tableHeader.date'),
      align: 'center',
      render: (text, record) => {
        return format(new Date(record.date), 'dd/MM/yyyy HH:mm');
      }
    }
  ];
};

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
