import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Spin, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import Graph from "./components/Graph";
import ControllersList from "./components/ControllersList";
import DiagnosticModal from "./components/DiagnosticsModal";
import { flatStatuses } from "./transformer";
import { fetchTemplate, reset } from "./IntegrationRemoteSlice";
import { getErrorMessage } from "utils/errorHandler";
import notification from "components/notification";
import Button from "components/Button";

import { PageHeader } from "styles/PageHeader.style";
import { PageCard, PageSectionTitle } from "styles/Utils.style";
import { StatsCard } from "styles/Report.style";

export default function IntegrationRemote() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const status = useSelector((state) => state.admin.integrationRemote.status);
  const [template, setTemplate] = useState(null);
  const [templateStatus, setTemplateStatus] = useState(null);
  const [diagnostics, setDiagnostics] = useState({});
  const [diagnosticsModal, setDiagnosticsModal] = useState(false);

  useEffect(() => {
    dispatch(fetchTemplate()).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        setDiagnostics(
          response.payload.data.data.diagnostics?.systemDiagnostics
            ?.aggregateSnapshot
        );
        setTemplate(response.payload.data.data.template);
        const flatStatus = {};
        flatStatuses(response.payload.data.data.status, flatStatus);
        setTemplateStatus(flatStatus);
      }
    });

    return () => {
      dispatch(reset());
    };
  }, []); //eslint-disable-line

  const getPercentageStatus = (formattedValue) => {
    if (!formattedValue) return "";

    const value = parseFloat(formattedValue.replace("%", ""));

    if (value > 80) {
      return "red";
    }

    if (value > 50 && value <= 80) {
      return "orange";
    }

    return "green";
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Integração: Acesso Remoto</h1>
          <div className="page-header-legend">
            Acesso remoto à ferramenta de integração
          </div>
        </div>
      </PageHeader>

      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Spin spinning={status === "loading"}>
            <PageCard
              style={{
                minHeight: "60vh",
                backgroundSize: "40px 40px",
                backgroundImage:
                  "linear-gradient(to right, #fafafa 1px, transparent 1px), linear-gradient(to bottom, #fafafa, 1px, transparent 1px)",
              }}
            >
              {template && templateStatus && (
                <Graph template={template} templateStatus={templateStatus} />
              )}
            </PageCard>
          </Spin>
        </Col>
        <Col xs={8}>
          <PageSectionTitle>Controllers</PageSectionTitle>
          <PageCard>
            <ControllersList
              template={template}
              templateStatus={templateStatus}
              loading={status === "loading"}
            />
          </PageCard>
        </Col>
        <Col xs={16}>
          <PageSectionTitle style={{ marginBottom: "2rem" }}>
            Diagnóstico
          </PageSectionTitle>
          <Row gutter={[12, 12]}>
            <Col xs={12}>
              <Spin spinning={status === "loading"}>
                <StatsCard
                  className={`${getPercentageStatus(
                    diagnostics?.flowFileRepositoryStorageUsage?.utilization
                  )}`}
                >
                  <div className="stats-title">Disco utilizado</div>
                  <div className="stats-value">
                    {diagnostics?.flowFileRepositoryStorageUsage?.utilization}
                  </div>
                </StatsCard>
              </Spin>
            </Col>
            <Col xs={12}>
              <Spin spinning={status === "loading"}>
                <StatsCard className={"green"}>
                  <div className="stats-title">Uptime</div>
                  <div className="stats-value">
                    {diagnostics?.uptime?.split(".")[0]}
                  </div>
                </StatsCard>
              </Spin>
            </Col>
            <Col xs={12}>
              <Spin spinning={status === "loading"}>
                <StatsCard className={"blue"}>
                  <div className="stats-title">Heap Utilizado</div>
                  <div className="stats-value">
                    {diagnostics?.heapUtilization}
                  </div>
                </StatsCard>
              </Spin>
            </Col>
            <Col xs={12}>
              <Spin spinning={status === "loading"}>
                <StatsCard className={"blue"}>
                  <div className="stats-title">Total Threads</div>
                  <div className="stats-value">{diagnostics?.totalThreads}</div>
                </StatsCard>
              </Spin>
            </Col>
            <Col xs={12}>
              <Spin spinning={status === "loading"}>
                <StatsCard className={""}>
                  <div className="stats-title">Versão</div>
                  <div className="stats-value">
                    {diagnostics?.versionInfo?.buildTag}
                  </div>
                </StatsCard>
              </Spin>
            </Col>
            <Col xs={12}>
              <StatsCard style={{ height: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Button
                    block
                    size="large"
                    type="link"
                    icon={<SearchOutlined />}
                    style={{ fontSize: "20px" }}
                    onClick={() => setDiagnosticsModal(true)}
                  >
                    Ver mais
                  </Button>
                </div>
              </StatsCard>
            </Col>
          </Row>
        </Col>
      </Row>
      {diagnostics && (
        <DiagnosticModal
          open={diagnosticsModal}
          setOpen={setDiagnosticsModal}
          data={diagnostics}
        />
      )}
    </>
  );
}
