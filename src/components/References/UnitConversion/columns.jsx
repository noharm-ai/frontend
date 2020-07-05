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
    title: <Tooltip title="Unidade padrão deve ter fator 1, demais unidades devem ser ajustadas com fator multiplicador para conversão." placement="top">Fator</Tooltip>,
    dataIndex: 'fator',
    width: 40,
    render: (entry, record) => (<Coefficient {...record} />)
  },
  {
    title: 'Contagem',
    dataIndex: 'contagem',
    width: 50
  }
].map(item => ({ ...item, key: item.dataIndex }));
