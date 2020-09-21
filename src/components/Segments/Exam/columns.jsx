import React from 'react';

import Tag from '@components/Tag';
import Tooltip from '@components/Tooltip';
import Button from '@components/Button';
import Icon from '@components/Icon';

const sortDirections = ['descend', 'ascend'];

export default (sortedInfo) => {
  return [
    {
      title: 'Tipo',
      dataIndex: 'type',
      sortDirections: sortDirections,
      sorter: (a, b) => a.type.localeCompare(b.type),
      sortOrder: sortedInfo.columnKey === 'type' && sortedInfo.order
    },
    {
      title: 'Ordem',
      dataIndex: 'order',
      sortDirections: sortDirections,
      sorter: (a, b) => a.order - b.order,
      sortOrder: sortedInfo.columnKey === 'order' && sortedInfo.order
    },
    {
      title: 'Nome',
      dataIndex: 'name',
      width: 350,
      sortDirections: sortDirections,
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order
    },
    {
      title: 'Rótulo',
      dataIndex: 'initials',
      sortDirections: sortDirections,
      sorter: (a, b) => a.initials.localeCompare(b.initials),
      sortOrder: sortedInfo.columnKey === 'initials' && sortedInfo.order
    },
    {
      title: 'Mínimo',
      dataIndex: 'min'
    },
    {
      title: 'Máximo',
      dataIndex: 'max'
    },
    {
      title: 'Referência',
      dataIndex: 'ref'
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
          <Tooltip title={'Alterar exame'}>
            <Button type="primary gtm-bt-view-exam" onClick={() => record.showModal(record)}>
              <Icon type="edit" />
            </Button>
          </Tooltip>
        );
      }
    }
  ];
};
