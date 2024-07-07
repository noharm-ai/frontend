import React from "react";
import { useTranslation } from "react-i18next";

import Tooltip from "components/Tooltip";
import Badge from "components/Badge";
import Tag from "components/Tag";

export default function DrugAlertLevelTag({
  levels,
  count,
  allergy = false,
  onClick = () => {},
}) {
  const { t } = useTranslation();

  const getAlertStyle = () => {
    const defaultColor = {
      background: "#7ebe9a",
      borderColor: "#7ebe9a",
      color: "#fff",
    };

    if (!levels.length) {
      return defaultColor;
    }

    if (levels.indexOf("high") !== -1) {
      return {
        background: "#f44336",
        borderColor: "#f44336",
        color: "#fff",
      };
    }

    if (levels.indexOf("medium") !== -1) {
      return {
        background: "#f57f17",
        borderColor: "#f57f17",
        color: "#fff",
      };
    }

    if (levels.indexOf("low") !== -1) {
      return {
        background: "#ffc107",
        borderColor: "#ffc107",
        color: "#fff",
      };
    }
  };

  return (
    <Tooltip
      title={
        allergy
          ? t("prescriptionDrugTags.alertsAllergy")
          : t("prescriptionDrugTags.alerts")
      }
    >
      <Badge dot count={allergy ? 1 : 0}>
        <Tag
          style={{
            ...getAlertStyle(),
            cursor: "pointer",
            marginRight: 0,
            width: "30px",
            textAlign: "center",
          }}
          onClick={() => onClick()}
        >
          {count}
        </Tag>
      </Badge>
    </Tooltip>
  );
}
