import React from 'react';

import Tag from '@components/Tag';

const getTypeName = (currentType, types) => {
  const index = types.findIndex(item => Object.keys(item)[0] === currentType);
  return Object.values(types[index])[0];
};

export default [
  {
    title: 'Medicamento relacionado',
    dataIndex: 'nameB',
    width: 350
  },
  {
    title: 'Tipo',
    render: (entry, record) => {
      return getTypeName(record.type, record.relationTypes);
    }
  },
  {
    title: 'Texto',
    dataIndex: 'text'
  },
  {
    title: 'Situação',
    render: (entry, record) => (
      <Tag color={record.active ? 'green' : null}>{record.active ? 'Ativo' : 'Inativo'}</Tag>
    )
  }
];
