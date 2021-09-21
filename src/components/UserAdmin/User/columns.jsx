import React from 'react';
import { sortableHandle } from 'react-sortable-hoc';

import Tag from '@components/Tag';
import Tooltip from '@components/Tooltip';
import Button from '@components/Button';
import Icon from '@components/Icon';

const DragHandle = sortableHandle(() => (
  <Icon
    type="menu"
    style={{
      fontSize: 18,
      color: '#696766',
      cursor: 'pointer'
    }}
  />
));

export default enableSortUsers => {
  const columns = [];
  if (enableSortUsers) {
    columns.push({
      title: 'Ordenar',
      dataIndex: 'order',
      align: 'center',
      render: (text, record) => <DragHandle />
    });
  }
  return [
    ...columns,
    {
      title: 'Id Externo',
      dataIndex: 'external'
    },
    {
      title: 'Nome',
      dataIndex: 'name',
      width: 350
    },
    {
      title: 'Email',
      dataIndex: 'email'
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
          <Tooltip title="Alterar usuário">
            <Button type="primary gtm-bt-view-exam" onClick={() => record.showModal(record)}>
              <Icon type="edit" />
            </Button>
          </Tooltip>
        );
      }
    }
  ];
};
