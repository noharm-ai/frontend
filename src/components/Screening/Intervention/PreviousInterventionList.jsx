import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { CaretDownOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Dropdown from "components/Dropdown";
import Empty from "components/Empty";
import { ExpandableTable } from "components/Table";
import { toDataSource } from "utils";
import InterventionStatus from "models/InterventionStatus";
import {
  startMultipleOutcome,
  setSelectedRows,
  setSelectedRowsActive,
} from "features/intervention/MultipleOutcome/MultipleOutcomeSlice";

import interventionColumns, { expandedInterventionRowRender } from "./columns";

export default function PreviousInterventionList({
  isFetching,
  interventions,
  isSaving,
  admissionNumber,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
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

  const multipleActionsMenu = () => {
    const outcomeItems = ["a", "n", "j", "x"].map((key) => ({
      key,
      label: InterventionStatus.translate(key, t).label,
      disabled: selectedRows.list.length === 0,
    }));

    return {
      items: [
        {
          key: "outcomes",
          type: "group",
          label: t("multipleIntervention.applyOutcome"),
          children: outcomeItems,
        },
        {
          type: "divider",
        },
        {
          key: "selectAll",
          label: t("multipleIntervention.selectAllPending"),
        },
        {
          key: "clearSelection",
          label: t("multipleIntervention.clearSelection"),
          disabled: selectedRows.list.length === 0,
        },
        {
          key: "cancel",
          label: t("actions.cancel"),
        },
      ],
      onClick: ({ key }) => {
        switch (key) {
          case "a":
          case "n":
          case "j":
          case "x":
            dispatch(
              startMultipleOutcome({
                idInterventionList: selectedRows.list,
                outcome: key,
              }),
            );
            break;
          case "selectAll":
            dispatch(setSelectedRows(pendingIds));
            break;
          case "clearSelection":
            dispatch(setSelectedRows([]));
            break;
          case "cancel":
            dispatch(setSelectedRowsActive(false));
            break;
          default:
            break;
        }
      },
    };
  };

  return (
    <>
      {pendingIds.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "10px",
            marginRight: "15px",
          }}
        >
          {selectedRows.active ? (
            <Dropdown
              menu={multipleActionsMenu()}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Button type="primary" icon={<CaretDownOutlined />}>
                {t("multipleIntervention.selected", {
                  count: selectedRows.list.length,
                })}
              </Button>
            </Dropdown>
          ) : (
            <Button onClick={() => dispatch(setSelectedRowsActive(true))}>
              {t("multipleIntervention.selectMultiple")}
            </Button>
          )}
        </div>
      )}

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
