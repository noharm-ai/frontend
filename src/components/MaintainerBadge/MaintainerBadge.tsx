import { useTranslation } from "react-i18next";
import { LockOutlined } from "@ant-design/icons";

import Tooltip from "components/Tooltip";

import { Badge } from "./MaintainerBadge.style";

/**
 * Marks a feature only maintainers (MAINTAINER permission) can see, so they
 * do not recommend it to client users, who have no access to it.
 */
export function MaintainerBadge() {
  const { t } = useTranslation();

  return (
    <Tooltip title={t("maintainerBadge.tooltip")}>
      <Badge>
        <LockOutlined />
        {t("maintainerBadge.label")}
      </Badge>
    </Tooltip>
  );
}
