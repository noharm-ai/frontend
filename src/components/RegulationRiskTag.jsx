import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "antd";

export default function RegulationRiskTag({ risk, ...props }) {
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

  return (
    <Badge
      status={getColor()}
      text={t(`regulation.risk.risk_${risk}`)}
      {...props}
    />
  );
}
