import React from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "antd";

export default function RegulationStageTag({ stage, ...props }) {
  const { t } = useTranslation();

  const getColor = () => {
    switch (stage) {
      case "INITIAL":
        return "default";
      case "WAITING_SCHEDULE":
        return "blue";
      case "FINISHED":
        return "green";
      default:
        return "default";
    }
  };

  return (
    <Tag color={getColor()} {...props}>
      {t(`regulation.stage.${stage}`)}
    </Tag>
  );
}
