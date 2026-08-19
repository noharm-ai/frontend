import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { CaretDownOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Dropdown from "components/Dropdown";
import Tooltip from "components/Tooltip";
import notification from "components/notification";
import InterventionStatus from "models/InterventionStatus";
import {
  startMultipleOutcome,
  setSelectedRows,
  setSelectedRowsActive,
  MAX_SELECTED_INTERVENTIONS,
} from "./MultipleOutcomeSlice";

export function MultipleOutcomeToolbar({ pendingIds, style }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selectedRows = useSelector(
    (state) => state.multipleInterventionOutcome.selectedRows,
  );

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
            dispatch(
              setSelectedRows(pendingIds.slice(0, MAX_SELECTED_INTERVENTIONS)),
            );

            if (pendingIds.length > MAX_SELECTED_INTERVENTIONS) {
              notification.info({
                message: t("multipleIntervention.maxSelected", {
                  max: MAX_SELECTED_INTERVENTIONS,
                }),
              });
            }
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
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "10px",
        ...style,
      }}
    >
      {pendingIds.length === 0 ? (
        <Tooltip title={t("multipleIntervention.noPending")}>
          <span>
            <Button disabled>
              {t("multipleIntervention.selectMultiple")}
            </Button>
          </span>
        </Tooltip>
      ) : selectedRows.active ? (
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
  );
}
