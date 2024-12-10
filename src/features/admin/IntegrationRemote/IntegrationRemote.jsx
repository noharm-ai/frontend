import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Spin, Row, Col } from "antd";
import {
  SearchOutlined,
  DeploymentUnitOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import ControllersList from "./components/ControllersList";
import DiagnosticModal from "./components/DiagnosticsModal";
import {
  fetchTemplate,
  reset,
  pushQueueRequest,
  getTemplateDate,
} from "./IntegrationRemoteSlice";
import { getErrorMessage } from "utils/errorHandler";
import notification from "components/notification";
import Button from "components/Button";
import { formatDateTime } from "utils/date";

import { PageHeader } from "styles/PageHeader.style";
import { PageCard, PageSectionTitle } from "styles/Utils.style";
import { StatsCard } from "styles/Report.style";

export default function IntegrationRemote() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector((state) => state.admin.integrationRemote.status);
  const [diagnostics, setDiagnostics] = useState({});
  const [diagnosticsModal, setDiagnosticsModal] = useState(false);
  const [updateDate, setUpdateDate] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadTemplate();

    return () => {
      dispatch(reset());
    };
  }, []); //eslint-disable-line

  const loadTemplate = () => {
    dispatch(fetchTemplate()).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
          description:
            "Clique em Atualizar Template para buscar a última versão",
        });
      } else {
        setDiagnostics(
          response.payload.diagnostics?.systemDiagnostics?.aggregateSnapshot
        );
        setUpdateDate(response.payload.response.data.data.updatedAt);
      }
    });
  };

  const refreshTemplate = () => {
    setUpdating(true);
    const payload = {
      actionType: "REFRESH_TEMPLATE",
    };

    dispatch(pushQueueRequest(payload)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: "Solicitação enviada!",
          description: "Aguarde a atualização do template",
        });

        const interval = setInterval(() => {
          dispatch(getTemplateDate()).then((response) => {
            const tplDate = response.payload.data.data.updatedAt;
            console.log("tpldate", tplDate);

            if (
              (!updateDate && tplDate) ||
              (updateDate && tplDate > updateDate)
            ) {
              loadTemplate();
              clearInterval(interval);
              setUpdating(false);

              notification.success({
                message: "Template atualizado!",
              });
            } else {
              console.log("waiting for template update");
              notification.info({
                message: "Aguardando atualização...",
              });
            }
          });
        }, 5000);
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

  return (
    <>
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
          {updateDate && (
            <div style={{ marginTop: "5px" }}>
              Atualizado em: {formatDateTime(updateDate)}
            </div>
          )}
        </div>
      </PageHeader>

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
