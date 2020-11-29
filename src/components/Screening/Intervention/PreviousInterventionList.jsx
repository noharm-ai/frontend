import React, { useEffect, useState } from 'react';

import Empty from '@components/Empty';
import { ExpandableTable } from '@components/Table';
import { toDataSource } from '@utils';

import interventionColumns, { expandedInterventionRowRender } from './columns';

export default function PreviousInterventionList({
  isFetching,
  interventions,
  saveInterventionStatus,
  checkIntervention
}) {
  const [dsInterventions, setDsInterventions] = useState([]);

  useEffect(() => {
    setDsInterventions(
      toDataSource(interventions, 'id', {
        saveInterventionStatus,
        check: checkIntervention
      })
    );
  }, [interventions, checkIntervention]); // eslint-disable-line

  return (
    <ExpandableTable
      columns={interventionColumns({ status: null })}
      pagination={false}
      loading={isFetching}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Nenhuma intervenção encontrada."
          />
        )
      }}
      dataSource={!isFetching ? dsInterventions : []}
      expandedRowRender={expandedInterventionRowRender}
    />
  );
}
