import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Row, Col, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import notification from "components/notification";
import { PageHeader } from "styles/PageHeader.style";
import { getConfig, reset } from "./ReportsSlice";
import Button from "components/Button";
import ReportCard from "./components/ReportCard/ReportCard";
import { PageCard } from "styles/Utils.style";

export default function Reports() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [currentReport, setCurrentReport] = useState(null);
  const status = useSelector(
    (state) => state.reportsArea.reports.config.status
  );
  const externalList = useSelector(
    (state) => state.reportsArea.reports.config.external
  );
  // const internalList = useSelector(
  //   (state) => state.reportsArea.reports.config.internal
  // );

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
              icon={<ArrowLeftOutlined />}
            >
              Voltar
            </Button>
          )}
        </div>
      </PageHeader>

      {!currentReport && (
        <Spin spinning={status === "loading"}>
          <Row type="flex" gutter={[20, 20]}>
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
