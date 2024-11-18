import React from "react";
import { useTranslation } from "react-i18next";
import { Badge, Tag } from "antd";

export default function RegulationRiskTag({ risk, tag = false, ...props }) {
  const { t } = useTranslation();

  const getColor = () => {
    switch (risk) {
      case 1:
        return "default";
      case 2:
        return "success";
      case 3:
        return "warning";
      case 4:
        return "error";
      default:
        return "default";
    }
  };

  if (tag) {
    return (
      <Tag color={getColor()} {...props}>
        {t(`regulation.risk.risk_${risk}`)}
      </Tag>
    );
  }

  return (
    <Badge
      status={getColor()}
      text={t(`regulation.risk.risk_${risk}`)}
      {...props}
    />
  );
}
