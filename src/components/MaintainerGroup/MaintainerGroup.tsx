import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LockOutlined } from "@ant-design/icons";

import Tooltip from "components/Tooltip";

import { Group } from "./MaintainerGroup.style";

/**
 * Outlines a set of controls only maintainers can see, when a MaintainerBadge
 * next to them would not make clear which ones it refers to.
 */
export function MaintainerGroup({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <Group data-testid="maintainer-group">
      <Tooltip title={t("maintainerBadge.tooltip")}>
        <span
          className="maintainer-lock"
          role="img"
          aria-label={t("maintainerBadge.label")}
        >
          <LockOutlined />
        </span>
      </Tooltip>
      {children}
    </Group>
  );
}
