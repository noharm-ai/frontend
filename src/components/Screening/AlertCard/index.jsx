import React from "react";
import { useTranslation } from "react-i18next";
import {
  ForkOutlined,
  HourglassOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";

import CustomIcon from "components/Icon";
import PrescriptionCard from "components/PrescriptionCard";
import Tooltip from "components/Tooltip";

import { AlertContainer } from "./index.style";

export const getAlerts = (stats, t) => [
  {
    label: t("alerts.y"),
    icon: () => <ForkOutlined />,
    value: stats.inc,
  },
  {
    label: t("alerts.interaction"),
    icon: () => <CustomIcon type="interactionAlert" />,
    value: stats.int,
  },
  {
    label: t("alerts.max_dose"),
    icon: () => <CustomIcon type="maxDose" />,
    value: stats.maxDose,
  },
  {
    label: t("alerts.exam"),
    icon: () => <ExperimentOutlined />,
    value: stats.exams,
  },
  {
    label: t("alerts.time"),
    icon: () => <HourglassOutlined />,
    value: stats.maxTime,
  },
  {
    label: t("alerts.elderly"),
    icon: () => <CustomIcon type="elderly" />,
    value: stats.elderly,
  },
  {
    label: t("alerts.alergy"),
    icon: () => <CustomIcon type="allergy" />,
    value: stats.allergy,
  },
  {
    label: t("alerts.tube"),
    icon: () => <CustomIcon type="tube" />,
    value: stats.tube,
  },
  {
    label: t("alerts.duplicate"),
    icon: () => <CustomIcon type="duplicity" />,
    value: stats.dup,
  },
];

export default function AlertCard({ stats }) {
  const { t } = useTranslation();

  if (!stats) {
    return null;
  }

  const alerts = getAlerts(stats, t);

  return (
    <PrescriptionCard>
      <div className="header">
        <h3 className="title">{t("tableHeader.alerts")}</h3>
      </div>
      <div className="content">
        <AlertContainer>
          {alerts.map((a) => (
            <Tooltip title={a.label} key={a.label}>
              <div className={a.value > 0 ? "alert" : ""}>
                {a.icon()} {a.value}
              </div>
            </Tooltip>
          ))}
        </AlertContainer>
      </div>
    </PrescriptionCard>
  );
}
