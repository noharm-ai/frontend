import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Row, Col, Spin } from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import notification from "components/notification";
import { PageHeader } from "styles/PageHeader.style";
import { PageContainer } from "styles/Utils.style";
import { getConfig, reset } from "./ReportsSlice";
import Button from "components/Button";
import ReportCard from "./components/ReportCard/ReportCard";
import { PageCard } from "styles/Utils.style";
import security from "services/security";

export default function Reports() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentReport, setCurrentReport] = useState(null);
  const status = useSelector(
    (state) => state.reportsArea.reports.config.status
  );
  const externalList = useSelector(
    (state) => state.reportsArea.reports.config.external
  );
  const internalList = useSelector(
    (state) => state.reportsArea.reports.config.internal
  );
  const roles = useSelector((state) => state.user.account.roles);
  const sec = security(roles);

  const internalReports = [
    {
      title: "Pacientes-Dia",
      description: "Métricas de análise de Pacientes-Dia",
      icon: "report",
      type: "internal",
      route: "/relatorios/pacientes-dia",
      visible: internalList.indexOf("PATIENT_DAY") !== -1,
    },
    {
      title: "Prescrições",
      description: "Métricas de análise de Prescrição",
      icon: "report",
      type: "internal",
      route: "/relatorios/prescricoes",
      visible: internalList.indexOf("PRESCRIPTION") !== -1,
    },
    {
      title: "Intervenções",
      description: "Métricas de análise de Prescrição",
      icon: "report",
      type: "internal",
      route: "/relatorios/intervencoes",
      visible: internalList.indexOf("INTERVENTION") !== -1,
    },
  ];

  useEffect(() => {
    dispatch(getConfig()).then((response) => {
      if (response.error) {
        notification.error({
          message: t("error.title"),
          description: t("error.description"),
        });
      }
    });

    return () => {
      dispatch(reset());
    };
  }, []); //eslint-disable-line

  const showReport = (data) => {
    setCurrentReport(data);
  };

  const showInternalReport = (data) => {
    navigate(data.route);
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">
            {currentReport ? currentReport.title : "Relatórios"}
          </h1>
          <div className="page-header-legend">
            {currentReport
              ? currentReport.description
              : "Lista de relatórios disponíveis"}
          </div>
        </div>
        <div className="page-header-actions">
          {currentReport && (
            <Button
              type="default"
              onClick={() => setCurrentReport(null)}
              icon={<UnorderedListOutlined />}
            >
              Ver todos relatórios
            </Button>
          )}
        </div>
      </PageHeader>

      <PageContainer>
        {!currentReport && (
          <Spin spinning={status === "loading"}>
            <Row type="flex" gutter={[20, 20]}>
              {internalReports.map((reportData, index) => (
                <>
                  {(reportData.visible ||
                    sec.isAdmin() ||
                    sec.isTraining()) && (
                    <Col key={index} span={24} md={12} lg={8}>
                      <ReportCard
                        css="height: 100%;"
                        reportData={reportData}
                        showReport={showInternalReport}
                        id={index}
                        className="gtm-report-item"
                      />
                    </Col>
                  )}
                </>
              ))}

              {externalList.map((reportData, index) => (
                <Col key={index} span={24} md={12} lg={8}>
                  <ReportCard
                    css="height: 100%;"
                    reportData={reportData}
                    showReport={showReport}
                    id={index}
                    className="gtm-report-item"
                  />
                </Col>
              ))}
            </Row>
          </Spin>
        )}
      </PageContainer>

      {currentReport && (
        <PageCard>
          <iframe
            title="Relatório"
            allowFullScreen
            width="100%"
            height={currentReport.height}
            className="dashboard-iframe"
            frameBorder="0"
            src={currentReport.link}
            style={{ border: 0 }}
          ></iframe>
        </PageCard>
      )}
    </>
  );
}
