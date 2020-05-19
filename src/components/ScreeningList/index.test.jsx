import React, { useEffect } from 'react';
import isEmpty from 'lodash.isempty';

import breakpoints from '@styles/breakpoints';
import { useMedia } from '@lib/hooks';
import { toDataSource } from '@utils';
import Empty from '@components/Empty';
import Table from '@components/Table';
import notification from '@components/notification';

import Filter from './Filter';

const setDataIndex = list => list.map(({ key, ...column }) => ({
  ...column,
  key,
  dataIndex: key
}))

const columns = setDataIndex([
  {
    key: 'class',
    width: 20,
    render: className => <span className={`flag ${className || 'green'}`} />
  },
  {
    title: 'Nome',
    key: 'namePatient'
  },
  {
    title: 'Data',
    key: 'dateFormated'
  },
  {
    title: 'Risco do paciente',
    children: setDataIndex([
      {
        title: 'MDRD',
        key: 'mdrd'
      },
      {
        title: 'CG',
        key: 'cg'
      },
      {
        title: 'TGO',
        key: 'tgo'
      },
      {
        title: 'TGP',
        key: 'tgp'
      },
      {
        title: 'K',
        key: 'k'
      },
      {
        title: 'NA',
        key: 'na'
      },
      {
        title: 'PRO',
        key: 'rni'
      }
    ])
  },
  {
    title: 'Risco da prescrição',
    children: setDataIndex([
      {
        title: 'AM',
        key: 'am'
      },
      {
        title: 'AV',
        key: 'av'
      },
      {
        title: 'S',
        key: 'tube'
      },
      {
        title: 'C',
        key: 'controlled'
      },
      {
        title: 'A',
        key: 'scoreThree'
      },
      {
        title: 'M',
        key: 'scoreTwo'
      },
      {
        title: 'B',
        key: 'scoreOne'
      },
      {
        title: 'T',
        key: 'prescriptionScore'
      }
    ])
  },
]);

// empty text for table result.
const emptyText = (
  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum paciente encontrado." />
);
// error message when fetch has error.
const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description: 'Aconteceu algo que nos impediu de lhe mostrar os dados, por favor, tente novamente.'
};
const noop = () => {};
const theTitle = () => 'Deslize para a direita para ver mais conteúdo.';

export default function ScreeningList({
  prescriptions,
  fetchSegmentsList,
  fetchPrescriptionsList,
  ...restProps
}) {
  const { isFetching, list, error } = prescriptions;
  const dataSource = toDataSource(list, 'idPrescription');

  // fetch data
  useEffect(() => {
    fetchSegmentsList();
    fetchPrescriptionsList();
  }, [fetchSegmentsList, fetchPrescriptionsList]);

  // show message if has error
  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error(errorMessage);
    }
  }, [error]);

  return (
    <>
      <Filter {...restProps} fetchPrescriptionsList={fetchPrescriptionsList} />
      <Table
        columns={columns}
        pagination={false}
        scroll={{ x: 800 }}
        loading={isFetching}
        locale={{ emptyText }}
        dataSource={!isFetching ? dataSource : []}
      />
    </>
  )
}
