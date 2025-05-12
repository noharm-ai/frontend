import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import {
  UserOutlined,
  NumberOutlined,
  MessageOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import DOMPurify from "dompurify";
import { Badge } from "antd";

import Tooltip from "components/Tooltip";
import Tag from "components/Tag";
import { getAlerts } from "components/Screening/AlertCard";
import PatientName from "containers/PatientName";
import { Card, AlertContainer } from "./index.style";

const TabContent = ({ tab, prescription, featureService }) => {
  const { t } = useTranslation();

  if (tab === "patient") {
    const alerts = getAlerts(prescription.alertStats || {}, t).filter(
      (a) => a.value > 0
    );

    return (
      <div className="attribute-container">
        <div className="attributes">
          <div className="attributes-item col-4">
            <div className="attributes-item-label">{t("patientCard.age")}</div>
            <div className="attributes-item-value">
              {prescription.age || "-"}
            </div>
          </div>
          <div className="attributes-item col-4">
            <div className="attributes-item-label">{t("labels.birthdate")}</div>
            <div className="attributes-item-value">
              {prescription.birthdateFormat || "-"}
            </div>
          </div>

          <div className="attributes-item col-4">
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
          <div className="attributes-item col-4">
            <div className="attributes-item-label">
              {t("patientCard.admission")}
            </div>
            <div className="attributes-item-value">
              {prescription.admissionNumber}
            </div>
          </div>
          <div className="attributes-item col-4">
            <div className="attributes-item-label">Setor</div>
            <div className="attributes-item-value">
              <Tooltip title={`${prescription.department}`}>
                {prescription.department}
              </Tooltip>
            </div>
          </div>
          <div className="attributes-item col-4">
            <div className="attributes-item-label">Leito</div>
            <div className="attributes-item-value">
              <Tooltip title={`${prescription.bed || " - "}`}>
                {prescription.bed || " - "}
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="attributes">
          <div className="attributes-item col-4">
            <div className="attributes-item-label">Convênio</div>
            <div className="attributes-item-value">
              <Tooltip title={`${prescription.insurance}`}>
                {prescription.insurance}
              </Tooltip>
            </div>
          </div>
          <div className="attributes-item col-4">
            <div className="attributes-item-label">
              {t("patientCard.prescriptionDate")}
            </div>
            <div className="attributes-item-value">
              {prescription.dateOnlyFormated}
            </div>
          </div>
          <div className="attributes-item col-4">
            <div className="attributes-item-label">Situação</div>
            <div className="attributes-item-value">
              {prescription.status === "s" && <Tag color="green">Checada</Tag>}
              {prescription.status !== "s" && (
                <>
                  {prescription.isBeingEvaluated ? (
                    <Tooltip title={"Pendente/Em Análise"}>
                      <Tag color="purple">Em análise</Tag>
                    </Tooltip>
                  ) : (
                    <Tag color="orange">Pendente</Tag>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        {featureService.hasPatientRevision() && (
          <div className="attributes">
            <div className="attributes-item col-4">
              <div className="attributes-item-label"></div>
              <div className="attributes-item-value"></div>
            </div>
            <div className="attributes-item col-4">
              <div className="attributes-item-label"></div>
              <div className="attributes-item-value"></div>
            </div>
            <div className="attributes-item col-4">
              <div className="attributes-item-label">Revisão</div>
              <div className="attributes-item-value">
                {prescription.reviewType === 1 && (
                  <Tag color="green">Revisado</Tag>
                )}
                {prescription.reviewType !== 1 && (
                  <>
                    {prescription.isBeingEvaluated ? (
                      <Tooltip title={"Pendente/Em Análise"}>
                        <Tag color="purple">Em análise</Tag>
                      </Tooltip>
                    ) : (
                      <Tag color="orange">Pendente</Tag>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
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

  if (tab === "observation") {
    return (
      <div className="attribute-container">
        <div className="attributes">
          <div className="attributes-item col-12">
            <div className="attributes-item-label">Anotações</div>
            <div
              className="attributes-item-value text"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(prescription.observation),
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "tags") {
    return (
      <div className="attribute-container">
        <div className="attributes">
          <div className="attributes-item col-12">
            <div className="attributes-item-label">Marcadores</div>
            <div className="attributes-item-value tags">
              {prescription?.patientTags
                ? prescription.patientTags?.map((tag) => (
                    <Tag style={{ marginRight: 0, fontSize: "13px" }} key={tag}>
                      {tag}
                    </Tag>
                  ))
                : "--"}
            </div>
          </div>
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
  featureService,
  activeTab,
  setActiveTab,
}) {
  const href =
    prioritizationType === "conciliation"
      ? `/conciliacao/${prescription.slug}`
      : `/prescricao/${prescription.slug}`;

  const tabClick = (tab, event) => {
    setActiveTab(tab);
    event.stopPropagation();
  };

  return (
    <Card
      $alert={prescription.dischargeReason ? "" : prescription.class}
      href={href}
      target="_blank"
    >
      <div className="card-header">
        <div
          className={`name ${
            prescription.dischargeFormated ? "discharged" : ""
          }`}
        >
          <Tooltip title={prescription.namePatient}>
            <PatientName
              idPatient={prescription.idPatient}
              name={prescription.namePatient}
            />
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
            {prioritization.formattedKey === "filled"
              ? prescription[prioritization.key]
                ? "Preenchido"
                : "-"
              : prescription[prioritization.formattedKey]}

            {prioritization.key === "globalScore" &&
              prescription.scoreVariation !== null && (
                <>
                  {prescription.scoreVariation > 0 && <ArrowUpOutlined />}
                  {prescription.scoreVariation < 0 && <ArrowDownOutlined />}
                </>
              )}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, transform: "translate3d(5px, 0, 0)" }}
        animate={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
        transition={{ duration: 0.3, ease: "linear" }}
        key={activeTab}
      >
        <TabContent
          tab={activeTab}
          prescription={prescription}
          featureService={featureService}
        />
      </motion.div>

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

        <div
          className={`tab ${activeTab === "observation" ? "active" : ""}`}
          onClick={(e) => tabClick("observation", e)}
        >
          <Badge dot count={prescription.observation ? 1 : 0}>
            <MessageOutlined />
          </Badge>
        </div>

        <div
          className={`tab ${activeTab === "tags" ? "active" : ""}`}
          onClick={(e) => tabClick("tags", e)}
        >
          <Badge
            dot
            count={
              prescription.patientTags && prescription.patientTags.length > 0
                ? 1
                : 0
            }
          >
            <TagsOutlined />
          </Badge>
        </div>
      </div>
    </Card>
  );
}
