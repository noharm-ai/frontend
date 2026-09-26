import { useTranslation } from "react-i18next";
import { LockOutlined } from "@ant-design/icons";

import Tooltip from "components/Tooltip";

import { Badge } from "./MaintainerBadge.style";

/**
 * Marks a feature only maintainers (MAINTAINER permission) can see, so they
 * do not recommend it to client users, who have no access to it. Just a lock
 * icon: the tooltip carries the explanation.
 */
export function MaintainerBadge() {
  const { t } = useTranslation();

  return (
    <Tooltip title={t("maintainerBadge.tooltip")}>
      <Badge
        role="img"
        aria-label={t("maintainerBadge.label")}
        data-testid="maintainer-badge"
      >
        <LockOutlined />
      </Badge>
    </Tooltip>
  );
}
