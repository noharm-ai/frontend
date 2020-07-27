import React from 'react';

import Tag from '@components/Tag';
import Tooltip from '@components/Tooltip';
import Button from '@components/Button';
import Icon from '@components/Icon';

export const getTypeName = (currentType, types) => {
  if (currentType == null || types == null) return '';

  var type = '';
  types.map(({ key, value }) => (type = currentType === key ? value : type));

  return type;
};

const truncateText = text => {
  if (!text) return text;
  const max = 40;
  const ellipsis = text.length > max ? '...' : '';

  return text.substring(0, Math.min(max, text.length)) + ellipsis;
};

export default [
  {
    title: 'Substância relacionada',
    sorter: (a, b) => a.nameB.localeCompare(b.nameB),
    sortDirections: ['descend', 'ascend'],
    dataIndex: 'nameB',
    width: 350
  },
  {
    title: 'Tipo',
    sorter: (a, b) =>
      getTypeName(a.type, a.relationTypes).localeCompare(getTypeName(b.type, b.relationTypes)),
    render: (entry, record) => {
      return getTypeName(record.type, record.relationTypes);
    }
  },
  {
    title: 'Efeito',
    render: (entry, { text }) => {
      const regex = /(<([^>]+)>)/gi;
      return text ? truncateText(text.replace(regex, '')) : '';
    }
  },
  {
    title: 'Situação',
    render: (entry, record) => (
      <Tag color={record.active ? 'green' : null}>{record.active ? 'Ativo' : 'Inativo'}</Tag>
    )
  },
  {
    title: 'Ações',
    key: 'operations',
    width: 70,
    align: 'center',
    render: (text, record) => {
      return (
        <Tooltip title={'Alterar relação'}>
          <Button type="primary gtm-bt-view-relation" onClick={() => record.showModal(record)}>
            <Icon type="edit" />
          </Button>
        </Tooltip>
      );
    }
  }
];
