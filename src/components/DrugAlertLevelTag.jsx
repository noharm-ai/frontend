import React from "react";
import { useTranslation } from "react-i18next";

import Tooltip from "components/Tooltip";
import Badge from "components/Badge";
import Tag from "components/Tag";

export default function DrugAlertLevelTag({
  levels,
  count,
  label,
  showTooltip = true,
  showDescription = false,
  allergy = false,
  onClick = () => {},
}) {
  const { t } = useTranslation();

  const getAlertStyle = () => {
    const defaultColor = {
      background: "transparent",
      borderColor: "transparent",
      color: "transparent",
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

  const getAlertDescription = () => {
    if (!levels.length) {
      return "-";
    }

    if (levels.indexOf("high") !== -1) {
      return "Alto";
    }

    if (levels.indexOf("medium") !== -1) {
      return "Médio";
    }

    if (levels.indexOf("low") !== -1) {
      return "Baixo";
    }
  };

  return (
    <Tooltip
      title={
        showTooltip
          ? allergy
            ? t("prescriptionDrugTags.alertsAllergy")
            : t("prescriptionDrugTags.alerts")
          : null
      }
    >
      <Badge dot count={allergy ? 1 : 0}>
        <Tag
          style={{
            ...getAlertStyle(),
            cursor: "pointer",
            marginRight: 0,
            width: showDescription || label ? "auto" : "30px",
            textAlign: "center",
            padding: showDescription || label ? "0 5px" : 0,
          }}
          onClick={() => onClick()}
        >
          {showDescription ? getAlertDescription() : count || label}
        </Tag>
      </Badge>
    </Tooltip>
  );
}
