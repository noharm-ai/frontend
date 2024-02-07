import React from "react";

import Tag from "components/Tag";
import IntegrationStatus from "models/IntegrationStatus";

export default function IntegrationStatusTag({ status, type, ...props }) {
  if (status === IntegrationStatus.INTEGRATION) {
    return (
      <Tag color={`${type === "filled" ? "#2db7f5" : "processing"}`} {...props}>
        INTEGRAÇÃO
      </Tag>
    );
  }

  if (status === IntegrationStatus.PRODUCTION) {
    return (
      <Tag color={`${type === "filled" ? "#87d068" : "success"}`} {...props}>
        PRODUÇÃO
      </Tag>
    );
  }

  if (status === IntegrationStatus.CANCELED) {
    return (
      <Tag color={`${type === "filled" ? "#f50" : "error"}`} {...props}>
        CANCELADO
      </Tag>
    );
  }

  return null;
}
