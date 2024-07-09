import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  ForkOutlined,
  HourglassOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";

import CustomIcon from "components/Icon";
import PrescriptionCard from "components/PrescriptionCard";
import Tooltip from "components/Tooltip";
import DefaultModal from "components/Modal";
import Button from "components/Button";
import AlertListReport from "features/reports/AlertListReport/AlertListReport";
import {
  setInitialFilters,
  setReportData,
} from "features/reports/AlertListReport/AlertListReportSlice";

import { AlertContainer } from "./index.style";

export const getAlerts = (stats, t) => [
  {
    label: t("alerts.y"),
    icon: () => <ForkOutlined />,
    value: stats.inc + stats.isl,
    filters: { typeList: ["iy", "sl"] },
  },
  {
    label: t("alerts.interaction"),
    icon: () => <CustomIcon type="interactionAlert" />,
    value: stats.int,
    filters: { typeList: ["it"] },
  },
  {
    label: t("alerts.max_dose"),
    icon: () => <CustomIcon type="maxDose" />,
    value: stats.maxDose,
    filters: { typeList: ["maxDose"] },
  },
  {
    label: t("alerts.exam"),
    icon: () => <ExperimentOutlined />,
    value: stats.exams,
    filters: { typeList: ["liver", "kidney", "platelets"] },
  },
  {
    label: t("alerts.time"),
    icon: () => <HourglassOutlined />,
    value: stats.maxTime,
    filters: { typeList: ["time"] },
  },
  {
    label: t("alerts.elderly"),
    icon: () => <CustomIcon type="elderly" />,
    value: stats.elderly,
    filters: { typeList: ["elderly"] },
  },
  {
    label: t("alerts.alergy"),
    icon: () => <CustomIcon type="allergy" />,
    value: stats.allergy + (stats?.interactions?.rx || 0),
    filters: { typeList: ["allergy", "rx"] },
  },
  {
    label: t("alerts.tube"),
    icon: () => <CustomIcon type="tube" />,
    value: stats.tube,
    filters: { typeList: ["tube"] },
  },
  {
    label: t("alerts.duplicate"),
    icon: () => <CustomIcon type="duplicity" />,
    value: stats.dup,
    filters: { typeList: ["dm", "dt"] },
  },
];

export default function AlertCard({ stats, prescription }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [modal, setModal] = useState(false);

  if (!stats) {
    return null;
  }

  const alerts = getAlerts(stats, t);

  const openModal = (filters = {}) => {
    dispatch(setInitialFilters(filters));
    dispatch(setReportData(prescription.alertsList));
    setModal(true);
  };

  return (
    <PrescriptionCard>
      <div className="header">
        <h3 className="title">
          {t("tableHeader.alerts")}
          <Button type="link gtm-btn-alerts-all" onClick={() => openModal()}>
            Ver todos
          </Button>
        </h3>
      </div>
      <div className="content">
        <AlertContainer>
          {alerts.map((a) => (
            <Tooltip title={a.label} key={a.label}>
              <div
                className={a.value > 0 ? "alert" : ""}
                onClick={() => openModal(a.filters)}
              >
                {a.icon()} <span>{a.value}</span>
              </div>
            </Tooltip>
          ))}
        </AlertContainer>
      </div>
      <DefaultModal
        destroyOnClose
        open={modal}
        onCancel={() => setModal(false)}
        width={"min(1440px, 100%)"}
        footer={null}
        style={{ top: "10px", height: "100vh" }}
      >
        <AlertListReport prescription={prescription} />
      </DefaultModal>
    </PrescriptionCard>
  );
}
