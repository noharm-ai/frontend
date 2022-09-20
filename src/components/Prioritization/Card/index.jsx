import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTransition, animated, config } from "@react-spring/web";
import { UserOutlined, NumberOutlined } from "@ant-design/icons";

import Tooltip from "components/Tooltip";
import Tag from "components/Tag";
import { getAlerts } from "components/Screening/AlertCard";
import { Card, AlertContainer } from "./index.style";

const TabContent = ({ tab, prescription }) => {
  const { t } = useTranslation();

  if (tab === "patient") {
    const alerts = getAlerts(prescription.alertStats || {}, t).filter(
      (a) => a.value > 0
    );

    return (
      <div className="attribute-container">
        <div className="attributes">
          <div className="attributes-item col-6">
            <div className="attributes-item-label">{t("patientCard.age")}</div>
            <div className="attributes-item-value">
              {prescription.age || "-"}
            </div>
          </div>
          <div className="attributes-item col-6">
            <div className="attributes-item-label">
              {t("patientCard.gender")}
            </div>
            <div className="attributes-item-value">
              {prescription.gender
                ? prescription.gender === "M"
                  ? t("patientCard.male")
                  : t("patientCard.female")
                : "-"}
            </div>
          </div>
        </div>
        <div className="attributes">
          <div className="attributes-item col-6">
            <div className="attributes-item-label">
              {t("patientCard.admission")}
            </div>
            <div className="attributes-item-value">
              {prescription.admissionNumber}
            </div>
          </div>
          <div className="attributes-item col-6">
            <div className="attributes-item-label">
              {t("patientCard.prescriptionDate")}
            </div>
            <div className="attributes-item-value">
              {prescription.dateOnlyFormated}
            </div>
          </div>
        </div>
        <div className="attributes">
          <div className="attributes-item col-6">
            <div className="attributes-item-label">
              Setor | Leito | Convênio
            </div>
            <div className="attributes-item-value">
              <Tooltip
                title={`${prescription.department} | ${
                  prescription.bed || " - "
                } | 
                ${prescription.insurance || " - "}`}
              >
                {prescription.department} | {prescription.bed || " - "} |{" "}
                {prescription.insurance || " - "}
              </Tooltip>
            </div>
          </div>
          <div className="attributes-item col-6">
            <div className="attributes-item-label">Situação</div>
            <div className="attributes-item-value">
              {prescription.status === "s" && <Tag color="green">Checada</Tag>}
              {prescription.status !== "s" && (
                <Tag color="orange">Pendente</Tag>
              )}
            </div>
          </div>
        </div>
        <div className="attributes">
          <div className="attributes-item col-12">
            <div className="attributes-item-label">Alertas</div>
            <div className="attributes-item-value">
              <AlertContainer>
                {alerts.length
                  ? alerts
                      .filter((a) => a.value > 0)
                      .map((a) => (
                        <Tooltip title={a.label} key={a.label}>
                          <div className="alert">
                            {a.icon()} {a.value}
                          </div>
                        </Tooltip>
                      ))
                  : "-"}
              </AlertContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "numbers") {
    return (
      <div className="attribute-container border-bottom">
        <div className="attributes">
          <Tooltip
            title={t("screeningList.clLengthHint")}
            mouseEnterDelay={0.5}
          >
            <div className="attributes-item col-4">
              <div className="attributes-item-label">
                {t("screeningList.clLengthHint")}
              </div>
              <div className="attributes-item-value">
                {prescription.lengthStay}
              </div>
            </div>
          </Tooltip>

          <Tooltip title={t("screeningList.clExamHint")} mouseEnterDelay={0.5}>
            <div className="attributes-item col-4">
              <div className="attributes-item-label">
                {t("screeningList.clExamHint")}
              </div>
              <div className="attributes-item-value">
                {prescription.alertExams}
              </div>
            </div>
          </Tooltip>

          <Tooltip title={t("screeningList.clAlertHint")} mouseEnterDelay={0.5}>
            <div className="attributes-item col-4">
              <div className="attributes-item-label">
                {t("screeningList.clAlertHint")}
              </div>
              <div className="attributes-item-value">{prescription.alerts}</div>
            </div>
          </Tooltip>
        </div>
        <div className="attributes">
          <Tooltip
            title={t("screeningList.clGlobalScoreHint")}
            mouseEnterDelay={0.5}
          >
            <div className="attributes-item col-4">
              <div className="attributes-item-label">
                {t("screeningList.clGlobalScoreHint")}
              </div>
              <div className="attributes-item-value">
                {prescription.globalScore}
              </div>
            </div>
          </Tooltip>

          <Tooltip title={t("screeningList.clAmHint")} mouseEnterDelay={0.5}>
            <div className="attributes-item col-4">
              <div className="attributes-item-label">
                {t("screeningList.clAmHint")}
              </div>
              <div className="attributes-item-value">{prescription.am}</div>
            </div>
          </Tooltip>

          <Tooltip title={t("screeningList.clAvHint")} mouseEnterDelay={0.5}>
            <div className="attributes-item col-4">
              <div className="attributes-item-label">
                {t("screeningList.clAvHint")}
              </div>
              <div className="attributes-item-value">{prescription.av}</div>
            </div>
          </Tooltip>
        </div>

        <div className="attributes">
          <Tooltip title={t("screeningList.clCHint")} mouseEnterDelay={0.5}>
            <div className="attributes-item col-4">
              <div className="attributes-item-label">
                {t("screeningList.clCHint")}
              </div>
              <div className="attributes-item-value">
                {prescription.controlled}
              </div>
            </div>
          </Tooltip>

          <Tooltip title={t("screeningList.clNpHint")} mouseEnterDelay={0.5}>
            <div className="attributes-item col-4">
              <div className="attributes-item-label">
                {t("screeningList.clNpHint")}
              </div>
              <div className="attributes-item-value">{prescription.np}</div>
            </div>
          </Tooltip>
          <Tooltip title={t("screeningList.clTubeHint")} mouseEnterDelay={0.5}>
            <div className="attributes-item col-4">
              <div className="attributes-item-label">
                {t("screeningList.clTubeHint")}
              </div>
              <div className="attributes-item-value">{prescription.tube}</div>
            </div>
          </Tooltip>
        </div>
        <div className="attributes">
          <Tooltip title={t("screeningList.clDiffHint")} mouseEnterDelay={0.5}>
            <div className="attributes-item col-4">
              <div className="attributes-item-label">
                {t("screeningList.clDiffHint")}
              </div>
              <div className="attributes-item-value">{prescription.diff}</div>
            </div>
          </Tooltip>

          <Tooltip
            title={t("screeningList.clInterventionsHint")}
            mouseEnterDelay={0.5}
          >
            <div className="attributes-item col-4">
              <div className="attributes-item-label">
                {t("screeningList.clInterventionsHint")}
              </div>
              <div className="attributes-item-value">
                {prescription.interventions}
              </div>
            </div>
          </Tooltip>

          <Tooltip
            title={t("screeningList.clPrescriptionScoreHint")}
            mouseEnterDelay={0.5}
          >
            <div className="attributes-item col-4">
              <div className="attributes-item-label">
                {t("screeningList.clPrescriptionScoreHint")}
              </div>
              <div className="attributes-item-value">
                {prescription.prescriptionScore}
              </div>
            </div>
          </Tooltip>
        </div>
      </div>
    );
  }

  return null;
};

export default function PrioritizationCard({
  prescription,
  prioritization,
  prioritizationType,
  highlight,
}) {
  const [activeTab, setActiveTab] = useState("patient");

  const transitions = useTransition(activeTab, {
    from: {
      opacity: 0,
      transform: "translate3d(5px, 0, 0)",
    },
    enter: { opacity: 1, transform: "translate3d(0, 0, 0)" },
    delay: 150,
    config: config.slow,
  });

  const open = () => {
    window.open(
      prioritizationType === "conciliation"
        ? `/conciliacao/${prescription.slug}`
        : `/prescricao/${prescription.slug}`
    );
  };

  const tabClick = (tab, event) => {
    setActiveTab(tab);
    event.stopPropagation();
  };

  return (
    <Card
      alert={prescription.dischargeReason ? "" : prescription.class}
      onClick={() => open()}
    >
      <div className="card-header">
        <div
          className={`name ${
            prescription.dischargeFormated ? "discharged" : ""
          }`}
        >
          <Tooltip title={prescription.namePatient}>
            {prescription.namePatient}
          </Tooltip>
          {prescription.dischargeFormated && (
            <Tooltip
              title={`Paciente com ${
                prescription.dischargeReason || "alta"
              } em ${prescription.dischargeFormated}`}
            >
              <div className="discharge">
                {`Paciente com ${prescription.dischargeReason || "alta"} em ${
                  prescription.dischargeFormated
                }`}
              </div>
            </Tooltip>
          )}
        </div>
        <div className={`stamp ${highlight ? "highlight" : ""}`}>
          <div className="stamp-label">{prioritization.label}</div>
          <div className="stamp-value">
            {prescription[prioritization.formattedKey]}
          </div>
        </div>
      </div>

      {transitions((styles) => (
        <animated.div style={styles}>
          <TabContent tab={activeTab} prescription={prescription} />
        </animated.div>
      ))}

      <div className="tabs">
        <div
          className={`tab ${activeTab === "patient" ? "active" : ""}`}
          onClick={(e) => tabClick("patient", e)}
        >
          <UserOutlined />
        </div>
        <div
          className={`tab ${activeTab === "numbers" ? "active" : ""}`}
          onClick={(e) => tabClick("numbers", e)}
        >
          <NumberOutlined />
        </div>
      </div>
    </Card>
  );
}
