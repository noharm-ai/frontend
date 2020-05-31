import React from 'react';

import Button from '@components/Button';
import Icon from '@components/Icon';
import Tooltip from '@components/Tooltip';

import Escore from './Escore';

const flags = ['green', 'yellow', 'orange', 'red'];

export default [
  {
    dataIndex: 'class',
    key: 'class',
    width: 20,
    render: (entry, { score, manualScore }) => <span className={`flag ${flags[parseInt(manualScore || score)]}`} />
  },
  {
    title: 'Medicamento',
    dataIndex: 'name',
    width: 350
  },
  {
    title: 'Dose',
    dataIndex: 'dose',
    width: 60,
    render: (entry, record) => `${record.dose} ${record.unit}`
  },
  {
    title: 'Frequência diária',
    dataIndex: 'frequency',
    width: 65
  },
  {
    title: 'Escore',
    dataIndex: 'score',
    width: 60
  },
  {
    title: 'Escore Manual',
    dataIndex: 'manualScore',
    width: 60,
    render: (entry, record) => <Escore {...record} />
  },
  {
    title: 'Contagem',
    dataIndex: 'countNum',
    width: 60
  },
  {
    title: 'Ações',
    key: 'operations',
    width: 70,
    align: 'center',
    render: (text, outlier) => {
      const hasObs = outlier.obs !== '';

      return (
        <Tooltip title={hasObs ? 'Ver/Editar comentário' : 'Adicionar comentário'}>
          <Button
            type="primary gtm-bt-view-obs"
            ghost={!hasObs}
            onClick={() => outlier.onShowObsModal(outlier)}
          >
            <Icon type="message" />
          </Button>
        </Tooltip>
      );
    }
  }
].map(item => ({ ...item, key: item.dataIndex }));
