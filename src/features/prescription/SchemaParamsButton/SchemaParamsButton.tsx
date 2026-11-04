import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Space } from "antd";
import { SettingOutlined } from "@ant-design/icons";

import Button from "components/Button";
import DefaultModal from "components/Modal";
import { MaintainerBadge } from "components/MaintainerBadge/MaintainerBadge";
import { MaintainerGroup } from "components/MaintainerGroup/MaintainerGroup";
import Permission from "models/Permission";
import PermissionService from "services/PermissionService";

import { SchemaParams } from "../SchemaParams/SchemaParams";

/**
 * Prescription page header button that opens the schema params, for
 * maintainers only (renders nothing for everyone else).
 */
export function SchemaParamsButton() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  if (!PermissionService().has(Permission.MAINTAINER)) {
    return null;
  }

  return (
    <>
      <span style={{ marginRight: "5px" }}>
        <MaintainerGroup>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<SettingOutlined />}
            onClick={() => setOpen(true)}
          >
            {t("schemaParams.open")}
          </Button>
        </MaintainerGroup>
      </span>
      <DefaultModal
        title={
          <Space size={8}>
            {t("titles.schemaParams")}
            <MaintainerBadge />
          </Space>
        }
        // unmounted on close: each open fetches the params again
        destroyOnHidden
        open={open}
        onCancel={() => setOpen(false)}
        width="min(1000px, 96vw)"
        style={{ top: 20 }}
        footer={null}
      >
        <div data-kb="prescription.schemaParams">
          <SchemaParams />
        </div>
      </DefaultModal>
    </>
  );
}
