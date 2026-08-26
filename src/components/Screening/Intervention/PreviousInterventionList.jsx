import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Empty from "components/Empty";
import { ExpandableTable } from "components/Table";
import { toDataSource } from "utils";
import { MultipleOutcomeToolbar } from "features/intervention/MultipleOutcome/MultipleOutcomeToolbar";

import interventionColumns, { expandedInterventionRowRender } from "./columns";

export default function PreviousInterventionList({
  isFetching,
  interventions,
  isSaving,
  admissionNumber,
}) {
  const { t } = useTranslation();
  const selectedRows = useSelector(
    (state) => state.multipleInterventionOutcome.selectedRows,
  );

  const visibleInterventions = interventions.filter((i) => i.status !== "0");
  const pendingIds = visibleInterventions
    .filter((i) => i.status === "s")
    .map((i) => i.idIntervention);

  const dsInterventions = toDataSource(visibleInterventions, null, {
    isSaving,
  });

  return (
    <>
      <MultipleOutcomeToolbar
        pendingIds={pendingIds}
        origin="prescricao"
        style={{ marginRight: "15px" }}
      />

      <ExpandableTable
        columns={interventionColumns(
          { status: null },
          false,
          admissionNumber,
          t,
          selectedRows.active ? selectedRows : null,
        )}
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
    </>
  );
}
