import React, { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Row, Col, Space, Spin } from "antd";
import { UnorderedListOutlined, QuestionOutlined } from "@ant-design/icons";

import Button from "components/Button";
import { PageHeader } from "styles/PageHeader.style";
import {
  StatsCard,
  ChartCard,
  SectionHeader,
  ReportContainer,
  ReportHeader,
  ReportFilterContainer,
} from "styles/Report.style";
import Filter from "./Filter/Filter";
import ChartPrescriptionDay from "./Charts/ChartPrescriptionDay";
import ChartResponsibles from "./Charts/ChartResponsibles";
import ChartDepartments from "./Charts/ChartDepartments";
import ChartSegments from "./Charts/ChartSegments";
import { ReactComponent as Brand } from "assets/noHarm-horizontal.svg";
import { filtersToDescription, formatDuration } from "utils/report";
import ChartScores from "./Charts/ChartScores";
import HelpModal from "./Help/Help";
import { setHelpModal } from "./PatientDayReportSlice";
import Tooltip from "components/Tooltip";
import SecurityService from "services/security";

export default function PatientDayReport() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const roles = useSelector((state) => state.user.account.roles);
  const reportData = useSelector(
    (state) => state.reportsArea.patientDay.filtered.result
  );
  const status = useSelector((state) => state.reportsArea.patientDay.status);
  const filteredStatus = useSelector(
    (state) => state.reportsArea.patientDay.filtered.status
  );
  const filters = useSelector((state) => state.reportsArea.patientDay.filters);
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
    departmentList: {
      label: "Setor",
      type: "list",
    },
    segmentList: {
      label: "Segmento",
      type: "list",
    },
    weekDays: {
      label: "Somente dias de semana",
      type: "bool",
    },
    tagList: {
      label: "Marcadores",
      type: "list",
    },
  };
  const securityService = SecurityService(roles);

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">
            Relatório: Pacientes-Dia{" "}
            <Tooltip title="Informações sobre este relatório">
              <Button
                type="primary"
                shape="circle"
                icon={<QuestionOutlined />}
                loading={status === "loading"}
                onClick={() => dispatch(setHelpModal(true))}
              />
            </Tooltip>
          </h1>
          <div className="page-header-legend">
            Métricas de Pacientes por dia
          </div>
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
            <h1>Relatório: Pacientes-Dia</h1>
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
            </SectionHeader>
            <Row gutter={[24, 24]}>
              <Col xs={12} lg={8}>
                <Spin spinning={isLoading}>
                  <StatsCard className={`blue `}>
                    <div className="stats-title">Total de Pacientes-Dia</div>
                    <div className="stats-value">
                      {reportData?.prescriptionTotals?.total.toLocaleString() ||
                        "-"}
                    </div>
                  </StatsCard>
                </Spin>
              </Col>
              <Col xs={12} lg={8}>
                <Spin spinning={isLoading}>
                  <StatsCard className={`green `}>
                    <div className="stats-title">Pacientes-Dia Checados</div>
                    <div className="stats-value">
                      {reportData?.prescriptionTotals?.checked.toLocaleString() ||
                        "-"}
                    </div>
                  </StatsCard>
                </Spin>
              </Col>
              <Col xs={12} lg={8}>
                <Spin spinning={isLoading}>
                  <StatsCard className={`green `}>
                    <div className="stats-title">
                      Percentual de Pacientes-Dia
                    </div>
                    <div className="stats-value">
                      {reportData?.prescriptionTotals?.checkedPercentage || "-"}
                      %
                    </div>
                  </StatsCard>
                </Spin>
              </Col>
              {securityService.hasCpoe() && (
                <>
                  <Col xs={12} lg={8}>
                    <Spin spinning={isLoading}>
                      <StatsCard className={`blue `}>
                        <div className="stats-title">Total de Itens-Dia</div>
                        <div className="stats-value">
                          {reportData?.itensTotals?.total.toLocaleString() ||
                            "-"}
                        </div>
                      </StatsCard>
                    </Spin>
                  </Col>
                  <Col xs={12} lg={8}>
                    <Spin spinning={isLoading}>
                      <StatsCard className={`green `}>
                        <div className="stats-title">Itens-Dia Checados</div>
                        <div className="stats-value">
                          {reportData?.itensTotals?.checked.toLocaleString() ||
                            "-"}
                        </div>
                      </StatsCard>
                    </Spin>
                  </Col>
                  <Col xs={12} lg={8}>
                    <Spin spinning={isLoading}>
                      <StatsCard className={`green `}>
                        <div className="stats-title">
                          Percentual de Itens-Dia
                        </div>
                        <div className="stats-value">
                          {reportData?.itensTotals?.checkedPercentage || "-"}%
                        </div>
                      </StatsCard>
                    </Spin>
                  </Col>
                  <Col xs={12} lg={8}>
                    <Spin spinning={isLoading}>
                      <StatsCard className={`blue `}>
                        <div className="stats-title">Total de Vidas</div>
                        <div className="stats-value">
                          {reportData?.lifes?.total.toLocaleString() || "-"}
                        </div>
                      </StatsCard>
                    </Spin>
                  </Col>
                  <Col xs={12} lg={8}>
                    <Spin spinning={isLoading}>
                      <StatsCard className={`orange `}>
                        <div className="stats-title">Vidas Impactadas</div>
                        <div className="stats-value">
                          {reportData?.lifes?.impacted.toLocaleString() || "-"}
                        </div>
                      </StatsCard>
                    </Spin>
                  </Col>
                  <Col xs={12} lg={8}>
                    <Spin spinning={isLoading}>
                      <StatsCard className={`orange `}>
                        <div className="stats-title">% de Vidas Impactadas</div>
                        <div className="stats-value">
                          {reportData?.lifes?.percentage || "-"}%
                        </div>
                      </StatsCard>
                    </Spin>
                  </Col>
                </>
              )}
              <Col xs={12} lg={8}>
                <Spin spinning={isLoading}>
                  <Tooltip title="*Experimental: tempo total gasto para avaliar os pacientes. Este tempo é baseado na duração entre a abertura da interface de prescrição até o momento da checagem.">
                    <StatsCard className={` `}>
                      <div className="stats-title">
                        *Tempo Total de Avaliação
                      </div>
                      <div className="stats-value">
                        {formatDuration(
                          reportData?.evaluationTimeSummary?.total
                        )}
                      </div>
                    </StatsCard>
                  </Tooltip>
                </Spin>
              </Col>
              <Col xs={12} lg={8}>
                <Spin spinning={isLoading}>
                  <Tooltip title="*Experimental: tempo médio gasto para avaliar pacientes. Este tempo é baseado na duração entre a abertura da interface de prescrição até o momento da checagem">
                    <StatsCard className={` `}>
                      <div className="stats-title">*Tempo Médio</div>
                      <div className="stats-value">
                        {formatDuration(
                          reportData?.evaluationTimeSummary?.average
                        )}
                      </div>
                    </StatsCard>
                  </Tooltip>
                </Spin>
              </Col>
              <Col xs={24}>*Valores experimentais</Col>
            </Row>

            <div className="page-break"></div>
            <SectionHeader>
              <h2>Pacientes-Dia</h2>
              <div>Relação entre Pacientes-Dia e Pacientes-Dia Checados</div>
            </SectionHeader>
            <Row gutter={[24, 24]}>
              <Col xs={24}>
                <Spin spinning={isLoading}>
                  <ChartCard className={`${isLoading ? "loading" : ""}`}>
                    <ChartPrescriptionDay
                      reportData={reportData}
                      isLoading={isLoading}
                    />
                  </ChartCard>
                </Spin>
              </Col>
            </Row>

            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <div className="page-break"></div>
                <Space direction="vertical" size="large">
                  <SectionHeader>
                    <h2>Checagem por Responsável</h2>
                    <div>Checagens agrupadas por responsável.</div>
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
                    <h2>Pacientes-Dia por Escore</h2>
                    <div>
                      Pacientes-Dia agrupados por escore e percentual de
                      checagem.
                    </div>
                  </SectionHeader>
                  <Spin spinning={isLoading}>
                    <ChartCard className={`${isLoading ? "loading" : ""}`}>
                      <ChartScores
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
                    <h2>Top 20 Setores</h2>
                    <div>Setores com maior número de checagens.</div>
                  </SectionHeader>
                  <Spin spinning={isLoading}>
                    <ChartCard className={`${isLoading ? "loading" : ""}`}>
                      <ChartDepartments
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
                    <h2>Checagem por Segmento</h2>
                    <div>Checagens agrupadas por segmento.</div>
                  </SectionHeader>
                  <Spin spinning={isLoading}>
                    <ChartCard className={`${isLoading ? "loading" : ""}`}>
                      <ChartSegments
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
