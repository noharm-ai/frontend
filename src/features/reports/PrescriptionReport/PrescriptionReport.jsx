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
import ChartScores from "./Charts/ChartScores";
import { ReactComponent as Brand } from "assets/noHarm-horizontal.svg";
import { filtersToDescription } from "utils/report";
import HelpModal from "./Help/Help";
import { setHelpModal } from "./PrescriptionReportSlice";
import Tooltip from "components/Tooltip";

export default function PrescriptionReport() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reportData = useSelector(
    (state) => state.reportsArea.prescription.filtered.result
  );
  const status = useSelector((state) => state.reportsArea.prescription.status);
  const filteredStatus = useSelector(
    (state) => state.reportsArea.prescription.filtered.status
  );
  const filters = useSelector(
    (state) => state.reportsArea.prescription.filters
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
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">
            Relatório: Prescrições{" "}
            <Tooltip title="Informações sobre este relatório">
              <Button
                type="primary"
                shape="circle"
                icon={<QuestionOutlined />}
                onClick={() => dispatch(setHelpModal(true))}
              />
            </Tooltip>
          </h1>
          <div className="page-header-legend">Métricas de Prescrições</div>
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
            <h1>Relatório: Prescrições</h1>
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
                    <div className="stats-title">Total de Prescrições</div>
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
                    <div className="stats-title">Prescrições Checadas</div>
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
                    <div className="stats-title">Percentual de Prescrições</div>
                    <div className="stats-value">
                      {reportData?.prescriptionTotals?.checkedPercentage || "-"}
                      %
                    </div>
                  </StatsCard>
                </Spin>
              </Col>
              <Col xs={12} lg={8}>
                <Spin spinning={isLoading}>
                  <StatsCard className={`blue `}>
                    <div className="stats-title">Total de Itens</div>
                    <div className="stats-value">
                      {reportData?.itensTotals?.total.toLocaleString() || "-"}
                    </div>
                  </StatsCard>
                </Spin>
              </Col>
              <Col xs={12} lg={8}>
                <Spin spinning={isLoading}>
                  <StatsCard className={`green `}>
                    <div className="stats-title">Itens Checados</div>
                    <div className="stats-value">
                      {reportData?.itensTotals?.checked.toLocaleString() || "-"}
                    </div>
                  </StatsCard>
                </Spin>
              </Col>
              <Col xs={12} lg={8}>
                <Spin spinning={isLoading}>
                  <StatsCard className={`green `}>
                    <div className="stats-title">Percentual de Dia</div>
                    <div className="stats-value">
                      {reportData?.itensTotals?.checkedPercentage || "-"}%
                    </div>
                  </StatsCard>
                </Spin>
              </Col>
              <Col xs={12} lg={8}>
                <Spin spinning={isLoading}>
                  <StatsCard className={`orange `}>
                    <div className="stats-title">Vidas Impactadas</div>
                    <div className="stats-value">
                      {reportData?.lifes?.toLocaleString() || "-"}
                    </div>
                  </StatsCard>
                </Spin>
              </Col>
              <Col xs={12} lg={8}>
                <Spin spinning={isLoading}>
                  <StatsCard className={` `}>
                    <div className="stats-title">Evoluções</div>
                    <div className="stats-value">
                      {reportData?.clinicalNotes?.toLocaleString() || "-"}
                    </div>
                  </StatsCard>
                </Spin>
              </Col>
            </Row>

            <div className="page-break"></div>
            <SectionHeader>
              <h2>Prescrições por Dia</h2>
              <div>
                Relação entre Prescrições e Prescrições Checadas por dia.
              </div>
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
                    <h2>Prescrições por Escore</h2>
                    <div>
                      Prescrições agrupadas por escore e percentual de checagem.
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
