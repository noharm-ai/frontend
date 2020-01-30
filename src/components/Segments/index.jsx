import React, { useEffect } from 'react';
// import isEmpty from 'lodash.isempty';

import breakpoints from '@styles/breakpoints';
import { useMedia } from '@lib/hooks';
import { toDataSource } from '@utils';
import Table from '@components/Table';
import Empty from '@components/Empty';

import columns from './columns';
import feedback from './feedback';

// empty text for table result.
const emptyText = (
  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum segmento encontrado." />
);
const noop = () => {};
const theTitle = () => 'Deslize para a direita para ver mais conteúdo.';

function Segments({ segments, outliers, generateOutlier, resetGenerate, fetchSegmentsList }) {
  const { generate } = outliers;
  const { isFetching, list } = segments;
  const [title] = useMedia([`(max-width: ${breakpoints.lg})`], [[theTitle]], [noop]);

  useEffect(() => {
    fetchSegmentsList();
  }, [fetchSegmentsList]);

  useEffect(() => {
    if (generate.status) {
      feedback(generate.status, generate);
      resetGenerate();
    }
  }, [generate, resetGenerate]);

  const bag = {
    outliers,
    generateOutlier
  };

  const dataSource = toDataSource(list, 'id', bag);

  return (
    <Table
      title={title}
      columns={columns}
      pagination={false}
      scroll={{ x: 800 }}
      loading={isFetching}
      locale={{ emptyText }}
      dataSource={!isFetching ? dataSource : []}
    />
  );
}

export default Segments;
