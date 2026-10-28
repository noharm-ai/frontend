import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Dropdown } from "antd";
import type { MenuProps } from "antd";
import {
  DownOutlined,
  FileSyncOutlined,
  UserAddOutlined,
} from "@ant-design/icons";

import { useAppDispatch } from "src/store";
import { MaintainerBadge } from "components/MaintainerBadge/MaintainerBadge";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";

import { BackfillType, runBackfill } from "../../InfectionControlListSlice";

/**
 * The integration utilities of the worklist (INTEGRATION_UTILS): following the
 * admissions already on antimicrobials when the feature is turned on, and
 * filling the report summary of the followed ones without it. `onDone`
 * reloads the list
 */
export function WorklistBackfill({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [running, setRunning] = useState(false);

  const run = (type: BackfillType) => {
    setRunning(true);
    dispatch(runBackfill({ type })).then((response: any) => {
      setRunning(false);
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
          description: t(`infectionControl.worklist.backfill.${type}.partial`, {
            processed: response.payload?.processed ?? 0,
            updated: response.payload?.updated ?? 0,
          }),
        });
      } else {
        notification.success({
          message: t(`infectionControl.worklist.backfill.${type}.done`, {
            processed: response.payload.processed,
            updated: response.payload.updated,
          }),
        });
      }
      onDone();
    });
  };

  const items: MenuProps["items"] = [
    {
      key: "admissions",
      icon: <UserAddOutlined />,
      label: t("infectionControl.worklist.backfill.admissions.label"),
    },
    {
      key: "summary",
      icon: <FileSyncOutlined />,
      label: t("infectionControl.worklist.backfill.summary.label"),
    },
  ];

  const onClick: MenuProps["onClick"] = ({ key }) => {
    const type = key as BackfillType;
    DefaultModal.confirm({
      title: t("infectionControl.worklist.backfill.confirmTitle"),
      content: t(`infectionControl.worklist.backfill.${type}.confirm`),
      okText: t("infectionControl.worklist.backfill.run"),
      cancelText: t("actions.cancel"),
      width: 500,
      onOk: () => run(type),
    });
  };

  return (
    <Dropdown trigger={["click"]} disabled={running} menu={{ items, onClick }}>
      <Button
        data-kb="infectionControl.worklist.backfill"
        icon={<DownOutlined />}
        iconPlacement="end"
        loading={running}
      >
        {t("infectionControl.worklist.backfill.button")} <MaintainerBadge />
      </Button>
    </Dropdown>
  );
}
