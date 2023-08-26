import React from "react";
import { useTranslation } from "react-i18next";

import Empty from "components/Empty";
import notification from "components/notification";
import { ExpandableTable } from "components/Table";
import { toDataSource } from "utils";

import interventionColumns, { expandedInterventionRowRender } from "./columns";

export default function PreviousInterventionList({
  isFetching,
  interventions,
  save,
  updateList,
  isSaving,
}) {
  const { t } = useTranslation();

  const saveIntervention = (data) => {
    save(data)
      .then((response) => {
        updateList(response.data[0]);
        notification.success({
          message: t("success.generic"),
        });
      })
      .catch(() => {
        notification.error({
          message: t("error.title"),
          description: t("error.description"),
        });
      });
  };

  const dsInterventions = toDataSource(
    interventions.filter((i) => i.status !== "0"),
    null,
    {
      saveIntervention,
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
