import React, { useEffect } from 'react';
import isEmpty from 'lodash.isempty';

import breakpoints from '@styles/breakpoints';
import { useMedia } from '@lib/hooks';
import { toDataSource } from '@utils';
import Table from '@components/Table';
import Empty from '@components/Empty';
import notification from '@components/notification';

import Filter from './Filter';
import columns from './columns';

// empty text for table result.
const emptyText = (
  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum dado encontrado." />
);
// error message when fetch has error.
const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description: 'Aconteceu algo que nos impediu de lhe mostrar os dados, por favor, tente novamente.'
};
const noop = () => {};
const theTitle = () => 'Deslize para a direita para ver mais conteúdo.';

export default function References({ outliers, fetchReferencesList, saveOutlier, ...restProps }) {
  const { isFetching, list, error } = outliers;
  const dataSource = toDataSource(list, 'idOutlier', { saveOutlier });
  const [title] = useMedia([`(max-width: ${breakpoints.lg})`], [[theTitle]], [noop]);

  useEffect(() => {
    fetchReferencesList()
  }, [fetchReferencesList]);

  // show message if has error
  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error(errorMessage);
    }
  }, [error]);

  return (
    <>
      <Filter {...restProps} outliers={outliers} />
      <Table
        title={title}
        columns={columns}
        pagination={false}
        scroll={{ x: 800 }}
        loading={isFetching}
        locale={{ emptyText }}
        dataSource={!isFetching ? dataSource : []}
      />
    </>
  );
}
