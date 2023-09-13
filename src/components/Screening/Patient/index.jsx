import "styled-components/macro";
import React, { useState } from "react";
import moment from "moment";
import { Row, Col } from "antd";
import { useTranslation } from "react-i18next";

import FormPatientModal from "containers/Forms/Patient";

import Button from "components/Button";
import Icon, { InfoIcon } from "components/Icon";
import Tooltip from "components/Tooltip";
import PrescriptionCard from "components/PrescriptionCard";

import { SeeMore } from "./Patient.style";
import ExamCard from "../Exam/Card";
import AlertCard from "../AlertCard";
import ClinicalNotesCard from "../ClinicalNotes/Card";
import PatientCard from "./Card";

export default function Patient({
  fetchScreening,
  access_token,
  prescription,
  checkPrescriptionDrug,
  selectIntervention,
  security,
  featureService,
  interventionCount,
  siderCollapsed,
  interventions,
}) {
  const {
    alertExams,
    exams,
    notesInfo,
    notesInfoDate,
    notesSigns,
    notesSignsDate,
    notesAllergies,
    notesDialysis,
    notesDialysisDate,
    alertStats,
    clinicalNotes,
    clinicalNotesStats,
    features,
  } = prescription;

  const [seeMore, setSeeMore] = useState(false);
  const [patientModalVisible, setPatientModalVisible] = useState(false);

  const { t } = useTranslation();

  const hasNoHarmCare = featureService.hasNoHarmCare();
  const hasAIData = hasNoHarmCare && (notesSigns !== "" || notesInfo !== "");
  const hasClinicalNotes = clinicalNotes > 0 || featureService.hasPrimaryCare();

  const toggleSeeMore = () => {
    setSeeMore(!seeMore);
  };

  const afterSavePatient = () => {
    fetchScreening(prescription.idPrescription);
    setPatientModalVisible(false);
  };

  const sortAllergies = (a, b) => {
    try {
      return Date.parse(a.date) < Date.parse(b.date)
        ? 1
        : Date.parse(a.date) > Date.parse(b.date)
        ? -1
        : 0;
    } catch {
      return 0;
    }
  };

  return (
    <Row gutter={8} type="flex">
      <Col md={8}>
        <PatientCard
          prescription={prescription}
          checkPrescriptionDrug={checkPrescriptionDrug}
          fetchScreening={fetchScreening}
          selectIntervention={selectIntervention}
          security={security}
          access_token={access_token}
          setSeeMore={setSeeMore}
          setPatientModalVisible={setPatientModalVisible}
          featureService={featureService}
          interventions={interventions}
        />
      </Col>
      <Col xl={10} xxl={11}>
        <ExamCard
          exams={exams}
          siderCollapsed={siderCollapsed}
          count={alertExams}
        />
      </Col>
      <Col xl={6} xxl={5}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          <AlertCard stats={alertStats} />
          {hasClinicalNotes && (
            <div style={{ marginTop: "10px" }}>
              <ClinicalNotesCard
                stats={clinicalNotesStats}
                total={clinicalNotes}
              />
            </div>
          )}
          {!hasClinicalNotes && (
            <div style={{ marginTop: "10px" }}>
              <PrescriptionCard style={{ minHeight: "113px" }}>
                <div className="header">
                  <h3 className="title">{t("tableHeader.interventions")}</h3>
                </div>
                <div className="content">
                  <div className="stat-number">{interventionCount}</div>
                </div>
                <div className="footer">
                  <div className="stats">
                    <>
                      {features && features.interventions}{" "}
                      {features && features.interventions === 1
                        ? t("tableHeader.pending")
                        : t("tableHeader.pendingPlural")}
                    </>
                  </div>
                  <div className="action"></div>
                </div>
              </PrescriptionCard>
            </div>
          )}
        </div>
      </Col>
      {seeMore && (
        <>
          {hasNoHarmCare && (
            <>
              <Col xs={8} style={{ marginTop: "10px" }}>
                <PrescriptionCard className="full-height info">
                  <div className="header">
                    <h3 className="title">
                      {t("clinicalNotesIndicator.info")}
                    </h3>
                  </div>
                  <div className="content">
                    <div className="text-content">
                      {notesInfo === "" ? "--" : notesInfo}
                    </div>
                  </div>
                  <div className="footer">
                    <div className="stats light">
                      <Tooltip title={t("tableHeader.extractionDate")}>
                        {notesInfoDate
                          ? moment(notesInfoDate).format("DD/MM/YYYY HH:mm")
                          : ""}
                      </Tooltip>
                    </div>
                    <div className="action bold">
                      {notesInfo !== "" && (
                        <Button
                          type="link gtm-btn-nhc-update-data"
                          onClick={() => setPatientModalVisible(true)}
                        >
                          {t("actions.useData")}
                        </Button>
                      )}
                    </div>
                  </div>
                </PrescriptionCard>
              </Col>
              <Col xs={8} style={{ marginTop: "10px" }}>
                <PrescriptionCard className="full-height signs">
                  <div className="header">
                    <h3 className="title">
                      {t("clinicalNotesIndicator.signs")}
                    </h3>
                  </div>
                  <div className="content">
                    <div className="text-content">
                      {notesSigns === "" ? "--" : notesSigns}
                    </div>
                  </div>
                  <div className="footer">
                    <div className="stats light">
                      <Tooltip title={t("tableHeader.extractionDate")}>
                        {notesSignsDate
                          ? moment(notesSignsDate).format("DD/MM/YYYY HH:mm")
                          : ""}
                      </Tooltip>
                    </div>
                  </div>
                </PrescriptionCard>
              </Col>
              {notesAllergies && notesAllergies.length > 0 && (
                <Col xs={8} style={{ marginTop: "10px" }}>
                  <PrescriptionCard className="full-height allergy">
                    <div className="header">
                      <h3 className="title">
                        {t("clinicalNotesIndicator.allergy")}
                      </h3>
                    </div>
                    <div className="content">
                      <div className="text-content list">
                        {notesAllergies
                          .sort(sortAllergies)
                          .map(({ text, date, source }) => (
                            <div key={text} className="list-item">
                              <div className="date">
                                {moment(date).format("DD/MM/YYYY HH:mm")}
                                {source === "care" ? " (NoHarm Care)" : ""}
                              </div>
                              <div className="text">{text}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </PrescriptionCard>
                </Col>
              )}

              {notesDialysisDate && (
                <Col xs={8} style={{ marginTop: "10px" }}>
                  <PrescriptionCard className="full-height dialysis">
                    <div className="header">
                      <h3 className="title">
                        {t("clinicalNotesIndicator.dialysis")}
                      </h3>
                    </div>
                    <div className="content">
                      <div className="text-content list">
                        {notesDialysis.map(({ text, date }) => (
                          <div key={date} className="list-item">
                            <div className="date">
                              {moment(date).format("DD/MM/YYYY HH:mm")}
                            </div>
                            <div className="text">{text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="footer">
                      <div className="stats light"></div>
                      <div className="action bold">
                        {notesInfo !== "" && (
                          <Button
                            type="link gtm-btn-nhc-update-data"
                            onClick={() => setPatientModalVisible(true)}
                          >
                            {t("actions.useData")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </PrescriptionCard>
                </Col>
              )}
            </>
          )}
        </>
      )}
      {hasNoHarmCare ? (
        <Col xs={24}>
          <SeeMore onClick={toggleSeeMore}>
            <Button type="link gtm-btn-seemore" onClick={toggleSeeMore}>
              <Icon type={seeMore ? "up" : "down"} />{" "}
              {seeMore ? t("patientCard.less") : t("patientCard.more")}
            </Button>
            {hasAIData && (
              <Tooltip title={t("patientCard.ctaNoHarmCare")}>
                {"  "}
                <InfoIcon />
              </Tooltip>
            )}
          </SeeMore>
        </Col>
      ) : (
        <div style={{ height: "15px" }}>&nbsp;</div>
      )}

      <FormPatientModal
        open={patientModalVisible}
        onCancel={() => setPatientModalVisible(false)}
        okText="Salvar"
        okType="primary gtm-bt-save-patient"
        cancelText="Cancelar"
        afterSavePatient={afterSavePatient}
      />
    </Row>
  );
}
