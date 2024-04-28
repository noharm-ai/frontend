import React from "react";
import { useTranslation } from "react-i18next";

import Empty from "components/Empty";
import { ExpandableTable } from "components/Table";
import { toDataSource } from "utils";

import interventionColumns, { expandedInterventionRowRender } from "./columns";

export default function PreviousInterventionList({
  isFetching,
  interventions,
  isSaving,
}) {
  const { t } = useTranslation();

  const dsInterventions = toDataSource(
    interventions.filter((i) => i.status !== "0"),
    null,
    {
      isSaving,
    }
  );

  return (
    <ExpandableTable
      columns={interventionColumns({ status: null }, false, t)}
      pagination={false}
      loading={isFetching}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Nenhuma intervenção encontrada."
          />
        ),
      }}
      dataSource={!isFetching ? dsInterventions : []}
      expandedRowRender={expandedInterventionRowRender}
    />
  );
}
