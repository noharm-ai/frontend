import React, { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Row, Col, Space, Spin } from "antd";
import { UnorderedListOutlined, QuestionOutlined } from "@ant-design/icons";

import Button from "components/Button";
import { PageHeader } from "styles/PageHeader.style";
import {
  StatsCard,
  SectionHeader,
  ReportContainer,
  ReportHeader,
  ReportFilterContainer,
  ChartCard,
} from "styles/Report.style";
import Filter from "./Filter/Filter";
import { ReactComponent as Brand } from "assets/noHarm-horizontal.svg";
import { filtersToDescription } from "utils/report";
import ChartStatus from "./Charts/ChartStatus";
import ChartResponsibles from "./Charts/ChartResponsibles";
import ChartReasons from "./Charts/ChartReasons";
import ChartDrugs from "./Charts/ChartDrugs";
import HelpModal from "./Help/Help";
import { setHelpModal } from "./InterventionReportSlice";
import Tooltip from "components/Tooltip";

export default function InterventionReport() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reportData = useSelector(
    (state) => state.reportsArea.intervention.filtered.result
  );
  const status = useSelector((state) => state.reportsArea.intervention.status);
  const filteredStatus = useSelector(
    (state) => state.reportsArea.intervention.filtered.status
  );
  const filters = useSelector(
    (state) => state.reportsArea.intervention.filters
  );
  const printRef = useRef(null);
  const isLoading = status === "loading" || filteredStatus === "loading";
  const filtersConfig = {
    dateRange: {
      label: "Período",
      type: "range",
    },
    responsibleList: {
      label: "Responsável",
      type: "list",
    },
    prescriberList: {
      label: "Prescritor",
      type: "list",
    },
    departmentList: {
      label: "Setor",
      type: "list",
    },
    segmentList: {
      label: "Segmento",
      type: "list",
    },
    reasonList: {
      label: "Motivo",
      type: "list",
    },
    drugList: {
      label: "Medicamento",
      type: "list",
    },
    weekDays: {
      label: "Somente dias de semana",
      type: "bool",
    },
    interventionType: {
      label: "Tipo de intervenção",
      type: "dict",
    },
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">
            Relatório: Intervenções{" "}
            <Tooltip title="Informações sobre este relatório">
              <Button
                type="primary"
                shape="circle"
                loading={status === "loading"}
                icon={<QuestionOutlined />}
                onClick={() => dispatch(setHelpModal(true))}
              />
            </Tooltip>
          </h1>
          <div className="page-header-legend">Métricas de Intervenções</div>
        </div>
        <div className="page-header-actions">
          <Button
            type="default"
            icon={<UnorderedListOutlined />}
            onClick={() => navigate("/relatorios")}
          >
            Ver todos relatórios
          </Button>
        </div>
      </PageHeader>

      <ReportContainer>
        <Filter printRef={printRef} />

        <div ref={printRef}>
          <ReportHeader className="report-header">
            <h1>Relatório: Intervenções</h1>
            <div className="brand">
              <Brand />
            </div>
          </ReportHeader>

          <ReportFilterContainer>
            <div
              className="report-filter-list"
              dangerouslySetInnerHTML={{
                __html: filtersToDescription(filters, filtersConfig),
              }}
            ></div>
          </ReportFilterContainer>
          <Space direction="vertical" size="large">
            <SectionHeader>
              <h2>Resumo</h2>
              <div>Totais por situação e percentual de aceitação.</div>
            </SectionHeader>

            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Spin spinning={isLoading}>
                  <ChartCard className={`${isLoading ? "loading" : ""}`}>
                    <ChartStatus
                      reportData={reportData}
                      isLoading={isLoading}
                    />
                  </ChartCard>
                </Spin>
              </Col>

              <Col xs={24} lg={12}>
                <Row gutter={[24, 24]}>
                  <Col xs={12}>
                    <Spin spinning={isLoading}>
                      <StatsCard className={`blue `}>
                        <div className="stats-title">Intervenções</div>
                        <div className="stats-value">
                          {reportData?.totals?.total.toLocaleString() || "-"}
                        </div>
                      </StatsCard>
                    </Spin>
                  </Col>
                  <Col xs={12}>
                    <Spin spinning={isLoading}>
                      <StatsCard className={`blue `}>
                        <div className="stats-title">Passíveis de Aceite</div>
                        <div className="stats-value">
                          {reportData?.totals?.totalAccountable.toLocaleString() ||
                            "-"}
                        </div>
                      </StatsCard>
                    </Spin>
                  </Col>
                  <Col xs={12}>
                    <Spin spinning={isLoading}>
                      <StatsCard className={`red`}>
                        <div className="stats-title">Não Aceitas</div>
                        <div className="stats-value">
                          {reportData?.totals?.totalNotAccepted.toLocaleString() ||
                            "-"}
                        </div>
                      </StatsCard>
                    </Spin>
                  </Col>
                  <Col xs={12}>
                    <Spin spinning={isLoading}>
                      <StatsCard className={`green `}>
                        <div className="stats-title">Aceitas</div>
                        <div className="stats-value">
                          {reportData?.totals?.totalAccepted.toLocaleString() ||
                            "-"}
                        </div>
                      </StatsCard>
                    </Spin>
                  </Col>
                  <Col xs={12}>
                    <Spin spinning={isLoading}>
                      <StatsCard className={`yellow `}>
                        <div className="stats-title">Pendentes</div>
                        <div className="stats-value">
                          {reportData?.totals?.totalPending.toLocaleString() ||
                            "-"}
                        </div>
                      </StatsCard>
                    </Spin>
                  </Col>
                  <Col xs={12}>
                    <Spin spinning={isLoading}>
                      <StatsCard className={`green `}>
                        <div className="stats-title">Aceitação</div>
                        <div className="stats-value">
                          {reportData?.totals?.acceptedPercentage.toLocaleString() ||
                            "-"}
                          %
                        </div>
                      </StatsCard>
                    </Spin>
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <div className="page-break"></div>
                <Space direction="vertical" size="large">
                  <SectionHeader>
                    <h2>Desfecho por Responsável</h2>
                    <div>Totais por responsável pela intervenção.</div>
                  </SectionHeader>
                  <Spin spinning={isLoading}>
                    <ChartCard className={`${isLoading ? "loading" : ""}`}>
                      <ChartResponsibles
                        reportData={reportData}
                        isLoading={isLoading}
                      />
                    </ChartCard>
                  </Spin>
                </Space>
              </Col>
              <Col xs={24} lg={12}>
                <div className="page-break"></div>
                <Space direction="vertical" size="large">
                  <SectionHeader>
                    <h2>Desfecho por Motivo</h2>
                    <div>Totais por motivo. Limitado em 20 motivos.</div>
                  </SectionHeader>
                  <Spin spinning={isLoading}>
                    <ChartCard className={`${isLoading ? "loading" : ""}`}>
                      <ChartReasons
                        reportData={reportData}
                        isLoading={isLoading}
                      />
                    </ChartCard>
                  </Spin>
                </Space>
              </Col>
              <Col xs={24}>
                <div className="page-break"></div>
                <Space direction="vertical" size="large">
                  <SectionHeader>
                    <h2>Desfecho por Medicamento</h2>
                    <div>
                      Totais por medicamento. Limitado em 30 medicamentos.
                    </div>
                  </SectionHeader>
                  <Spin spinning={isLoading}>
                    <ChartCard className={`${isLoading ? "loading" : ""}`}>
                      <ChartDrugs
                        reportData={reportData}
                        isLoading={isLoading}
                      />
                    </ChartCard>
                  </Spin>
                </Space>
              </Col>
            </Row>
          </Space>
        </div>
      </ReportContainer>
      <HelpModal />
    </>
  );
}
