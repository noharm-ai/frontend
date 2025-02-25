import "styled-components";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import moment from "moment";
import { Row, Col, Flex, notification, Popconfirm } from "antd";
import { useTranslation } from "react-i18next";
import {
  CaretDownOutlined,
  CaretUpOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import Button from "components/Button";
import { InfoIcon } from "components/Icon";
import Tooltip from "components/Tooltip";
import PrescriptionCard from "components/PrescriptionCard";

import { SeeMore } from "./Patient.style";
import ExamCard from "../Exam/Card";
import AlertCard from "../AlertCard";
import ClinicalNotesCard from "../ClinicalNotes/Card";
import ScoreCard from "../ScoreCard/ScoreCard";
import PatientCard from "./Card";
import { selectSingleClinicalNotes } from "features/prescription/PrescriptionSlice";

export default function Patient({
  fetchScreening,
  prescription,
  checkPrescriptionDrug,
  selectIntervention,
  security,
  featureService,
  siderCollapsed,
  interventions,
  setModalVisibility,
  removeNotes,
}) {
  const dispatch = useDispatch();
  const {
    alertExams,
    exams,
    notesInfo,
    notesInfoId,
    notesInfoDate,
    notesSigns,
    notesSignsId,
    notesSignsDate,
    notesAllergies,
    notesDialysis,
    notesDialysisDate,
    alertStats,
    clinicalNotes,
    clinicalNotesStats,
  } = prescription;

  const [seeMore, setSeeMore] = useState(false);
  const [isRemovingNotes, setIsRemovingNotes] = useState(false);

  const { t } = useTranslation();

  const hasAIData = notesSigns !== "" || notesInfo !== "";

  const toggleSeeMore = () => {
    setSeeMore(!seeMore);
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

  const actionRemoveNotes = (id, type) => {
    setIsRemovingNotes(true);
    removeNotes(id, type)
      .then(() => {
        setIsRemovingNotes(false);
        notification.success({ message: "Anotação removida com sucesso!" });
      })
      .catch((err) => {
        setIsRemovingNotes(false);
        notification.error({
          message: err?.message || "Ocorreu um erro inesperado.",
        });
      });
  };

  return (
    <Row gutter={[8, 16]} type="flex">
      <Col xs={24} xl={8}>
        <PatientCard
          prescription={prescription}
          checkPrescriptionDrug={checkPrescriptionDrug}
          fetchScreening={fetchScreening}
          selectIntervention={selectIntervention}
          security={security}
          setSeeMore={setSeeMore}
          setModalVisibility={setModalVisibility}
          featureService={featureService}
          interventions={interventions}
        />
      </Col>
      <Col xs={24} md={14} xl={10} xxl={11}>
        <ExamCard
          admissionNumber={prescription.admissionNumber}
          exams={exams}
          siderCollapsed={siderCollapsed}
          count={alertExams}
        />
      </Col>
      <Col xs={24} md={10} xl={6} xxl={5}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <div style={{ flex: 1 }}>
            <AlertCard stats={alertStats} prescription={prescription} />
          </div>

          <Flex style={{ marginTop: "8px" }} gap={8}>
            <div style={{ flex: 1 }}>
              <ClinicalNotesCard
                stats={clinicalNotesStats}
                total={clinicalNotes}
                featureService={featureService}
              />
            </div>
            <div style={{ width: "50%", maxWidth: "160px" }}>
              <ScoreCard prescription={prescription} />
            </div>
          </Flex>
        </div>
      </Col>
      {seeMore && (
        <>
          <Col xs={24} md={12} lg={8} style={{ marginTop: "10px" }}>
            <PrescriptionCard className="full-height info">
              <div className="header">
                <h3 className="title">{t("clinicalNotesIndicator.info")}</h3>
              </div>
              <div className="content">
                <div className="text-content">
                  {notesInfoId ? (
                    <span
                      className="text-link"
                      onClick={() =>
                        dispatch(selectSingleClinicalNotes(notesInfoId))
                      }
                    >
                      <Tooltip title="Visualizar evolução">
                        {notesInfo === "" ? "--" : notesInfo}
                      </Tooltip>
                    </span>
                  ) : (
                    <>{notesInfo === "" ? "--" : notesInfo}</>
                  )}
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
                      type="link"
                      className="gtm-btn-nhc-update-data"
                      onClick={() => setModalVisibility("patientEdit", true)}
                    >
                      {t("actions.useData")}
                    </Button>
                  )}
                </div>
              </div>
            </PrescriptionCard>
          </Col>
          <Col xs={24} md={12} lg={8} style={{ marginTop: "10px" }}>
            <PrescriptionCard className="full-height signs">
              <div className="header">
                <h3 className="title">{t("clinicalNotesIndicator.signs")}</h3>
              </div>
              <div className="content">
                <div className="text-content">
                  {notesSignsId ? (
                    <span
                      className="text-link"
                      onClick={() =>
                        dispatch(selectSingleClinicalNotes(notesSignsId))
                      }
                    >
                      <Tooltip title="Visualizar evolução">
                        {notesSigns === "" ? "--" : notesSigns}
                      </Tooltip>
                    </span>
                  ) : (
                    <>{notesSigns === "" ? "--" : notesSigns}</>
                  )}
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
            <Col xs={24} md={12} lg={8} style={{ marginTop: "10px" }}>
              <PrescriptionCard className="full-height allergy">
                <div className="header">
                  <h3 className="title">
                    {t("clinicalNotesIndicator.allergy")}
                  </h3>
                </div>
                <div className="content">
                  <div className="text-content list">
                    {notesAllergies
                      .slice()
                      .sort(sortAllergies)
                      .map(({ text, date, source, id }) => (
                        <div key={text} className="list-item">
                          <div>
                            <div className="date">
                              {moment(date).format("DD/MM/YYYY HH:mm")}
                              {source === "care" ? " (NoHarm Care)" : ""}
                            </div>
                            {source === "care" ? (
                              <div
                                className="text-link"
                                onClick={() =>
                                  dispatch(selectSingleClinicalNotes(id))
                                }
                              >
                                <Tooltip title="Visualizar evolução">
                                  {text}
                                </Tooltip>
                              </div>
                            ) : (
                              <div className="text">{text}</div>
                            )}
                          </div>
                          {source === "care" && (
                            <div>
                              <Popconfirm
                                title="Remover anotação"
                                description="Confirma a remoção desta anotação?"
                                okText="Sim"
                                cancelText="Não"
                                onConfirm={() =>
                                  actionRemoveNotes(id, "allergy")
                                }
                              >
                                <Tooltip title="Remover anotação">
                                  <Button
                                    icon={<DeleteOutlined />}
                                    ghost
                                    danger
                                    loading={isRemovingNotes}
                                    size="small"
                                  />
                                </Tooltip>
                              </Popconfirm>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </PrescriptionCard>
            </Col>
          )}

          {notesDialysisDate && (
            <Col xs={24} md={12} lg={8} style={{ marginTop: "10px" }}>
              <PrescriptionCard className="full-height dialysis">
                <div className="header">
                  <h3 className="title">
                    {t("clinicalNotesIndicator.dialysis")}
                  </h3>
                </div>
                <div className="content">
                  <div className="text-content list">
                    {notesDialysis.map(({ text, date, id }) => (
                      <div key={date} className="list-item">
                        <div>
                          <div className="date">
                            {moment(date).format("DD/MM/YYYY HH:mm")} (NoHarm
                            Care)
                          </div>

                          <div
                            className="text-link"
                            onClick={() =>
                              dispatch(selectSingleClinicalNotes(id))
                            }
                          >
                            <Tooltip title="Visualizar evolução">
                              {text}
                            </Tooltip>
                          </div>
                        </div>
                        <div>
                          <Popconfirm
                            title="Remover anotação"
                            description="Confirma a remoção desta anotação?"
                            okText="Sim"
                            cancelText="Não"
                            onConfirm={() => actionRemoveNotes(id, "dialysis")}
                          >
                            <Tooltip title="Remover anotação">
                              <Button
                                icon={<DeleteOutlined />}
                                ghost
                                danger
                                loading={isRemovingNotes}
                              />
                            </Tooltip>
                          </Popconfirm>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="footer">
                  <div className="stats light"></div>
                  <div className="action bold">
                    {notesInfo !== "" && (
                      <Button
                        type="link"
                        className="gtm-btn-nhc-update-data"
                        onClick={() => setModalVisibility("patientEdit", true)}
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

      <Col xs={24}>
        <SeeMore onClick={toggleSeeMore}>
          <Button
            type="link"
            className="gtm-btn-seemore"
            onClick={toggleSeeMore}
            icon={seeMore ? <CaretUpOutlined /> : <CaretDownOutlined />}
            iconPosition="end"
          >
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
    </Row>
  );
}
