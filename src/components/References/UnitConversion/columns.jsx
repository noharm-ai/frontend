import 'styled-components/macro';
import React from 'react';
import Coefficient from './Coefficient';
import Tooltip from '@components/Tooltip';

export default [
  {
    title: 'Medicamento',
    dataIndex: 'drugName',
    width: 350
  },
  {
    title: 'Unidade',
    dataIndex: 'description',
    width: 50
  },
  {
    title: 'Fator',
    dataIndex: 'fator',
    width: 40,
    render: (entry, record) => (record.isAdmin ? <Coefficient {...record} /> : record.fator)
  },
  {
    title: <Tooltip title="Somatório de todo o Hospital">Contagem *</Tooltip>,
    dataIndex: 'contagem',
    width: 50
  }
].map(item => ({ ...item, key: item.dataIndex }));
