import React from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "antd";

import RegulationStage from "models/regulation/RegulationStage";

export default function RegulationStageTag({ stage, ...props }) {
  const { t } = useTranslation();

  const getColor = () => {
    const config = RegulationStage.getStages(t).find((s) => s.id === stage);

    if (config) {
      return config.color;
    }

    return "default";
  };

  return (
    <Tag color={getColor()} {...props}>
      {t(`regulation.stage.${stage}`)}
    </Tag>
  );
}
