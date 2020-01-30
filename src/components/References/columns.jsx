import React from 'react';

import Escore from './Escore';

export default [
  {
    title: 'Medicamento',
    dataIndex: 'name',
    width: 350
  },
  {
    title: 'Dose',
    dataIndex: 'dose',
    width: 100
  },
  {
    title: 'Frequência diária',
    dataIndex: 'frequency'
  },
  {
    title: 'Escore',
    dataIndex: 'score'
  },
  {
    title: 'Escore Manual',
    dataIndex: 'manualScore',
    render: (entry, record) => <Escore {...record} />
  },
  {
    title: 'Contagem',
    dataIndex: 'countNum'
  },
].map(item => ({ ...item, key: item.dataIndex }));
