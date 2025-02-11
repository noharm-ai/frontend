import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Spin, Row, Col, Result, Space } from "antd";
import {
  SearchOutlined,
  DeploymentUnitOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import ControllersList from "./components/ControllersList";
import DiagnosticModal from "./components/DiagnosticsModal";
import {
  fetchTemplate,
  pushQueueRequest,
  getQueueStatus,
} from "./IntegrationRemoteSlice";
import { getErrorMessage } from "utils/errorHandler";
import notification from "components/notification";
import Button from "components/Button";
import { formatDateTime } from "utils/date";
import ListConnections from "./components/ListConnections";
import ListProcessors from "./components/ListProcessors";
import ListBulletin from "./components/ListBulletin";

import { PageHeader } from "styles/PageHeader.style";
import { PageCard, PageSectionTitle } from "styles/Utils.style";
import { StatsCard } from "styles/Report.style";

export default function IntegrationRemote() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector((state) => state.admin.integrationRemote.status);
  const templateDate = useSelector(
    (state) => state.admin.integrationRemote.template.date
  );
  const diagnostics = useSelector(
    (state) => state.admin.integrationRemote.template.diagnostics
  );
  const [diagnosticsModal, setDiagnosticsModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // if (!templateDate) {
    //   refreshTemplate();
    // }
    loadTemplate();
  }, []); //eslint-disable-line

  const loadTemplate = () => {
    dispatch(fetchTemplate()).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
          description:
            "Clique em Atualizar Template para buscar a última versão",
        });
      }
    });
  };

  const refreshTemplate = () => {
    setUpdating(true);
    const payload = {
      actionType: "REFRESH_TEMPLATE",
    };

    dispatch(pushQueueRequest(payload)).then((queueResponse) => {
      if (queueResponse.error) {
        notification.error({
          message: getErrorMessage(queueResponse, t),
        });
      } else {
        const idQueueList = [queueResponse.payload.data.data.id];

        notification.success({
          message: "Atualizando template!",
          description: "Aguarde...",
        });

        let repeats = 0;

        const interval = setInterval(() => {
          repeats += 1;
          dispatch(getQueueStatus({ idQueueList })).then((response) => {
            const queue = response.payload.response.data.data.queue[0];

            if (queue.responseCode === 200) {
              loadTemplate();
              clearInterval(interval);
              setUpdating(false);

              notification.success({
                message: "Template atualizado!",
              });
            } else if (queue.responseCode === null) {
              if (repeats > 15) {
                clearInterval(interval);
                setUpdating(false);
                setError(true);
              } else {
                notification.info({
                  message: "Aguardando atualização...",
                });
              }
            } else {
              notification.error({
                message: "Erro ao atualizar template",
              });
              clearInterval(interval);
              setUpdating(false);
              setError(true);
            }
          });
        }, 2500);
      }
    });
  };

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

  if (error) {
    return (
      <Result
        status="error"
        title="Parece que o nifi não está respondendo"
        subTitle="Por favor, verifique se os processos estão instalados e ativos no nifi."
      ></Result>
    );
  }

  return (
    <Spin spinning={updating}>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Integração: Acesso Remoto</h1>
          <div className="page-header-legend">
            Acesso remoto à ferramenta de integração
          </div>
        </div>
        <div className="page-header-actions">
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => refreshTemplate()}
            loading={updating}
          >
            Atualizar Template
          </Button>
          <Button
            type="primary"
            icon={<DeploymentUnitOutlined />}
            onClick={() => navigate("/admin/integracao/acesso-remoto/nifi")}
          >
            Acessar Nifi Remoto
          </Button>
          {templateDate && (
            <div style={{ marginTop: "5px" }}>
              Atualizado em: {formatDateTime(templateDate)}
            </div>
          )}
        </div>
      </PageHeader>

      <Space direction="vertical" style={{ width: "100%" }}>
        <Row gutter={[24, 24]}>
          <Col xs={8}>
            <PageSectionTitle>Controllers</PageSectionTitle>
            <PageCard>
              <ControllersList />
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
                    <div className="stats-value">
                      {diagnostics?.totalThreads}
                    </div>
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
        <div>
          <PageSectionTitle style={{ marginBottom: "1.5rem" }}>
            Bulletin Board
          </PageSectionTitle>
          <ListBulletin />
        </div>
        <div>
          <PageSectionTitle style={{ marginBottom: "1.5rem" }}>
            Filas
          </PageSectionTitle>
          <ListConnections />
        </div>

        <div>
          <PageSectionTitle style={{ marginBottom: "1.5rem" }}>
            Processos
          </PageSectionTitle>
          <ListProcessors />
        </div>
      </Space>

      {diagnostics && (
        <DiagnosticModal
          open={diagnosticsModal}
          setOpen={setDiagnosticsModal}
          data={diagnostics}
        />
      )}
    </Spin>
  );
}
