import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { Row, Col, Space, Spin } from "antd";

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
import { filtersToDescription } from "utils/report";

export default function PrescriptionReport() {
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
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Relatório Geral: Prescrições</h1>
          <div className="page-header-legend">Métricas de Prescrições</div>
        </div>
      </PageHeader>

      <ReportContainer>
        <Filter printRef={printRef} />

        <div ref={printRef}>
          <ReportHeader className="report-header">
            <h1>Relatório Geral: Prescrições</h1>
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
            <SectionHeader>Resumo</SectionHeader>
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
            <SectionHeader>Prescrições por Dia</SectionHeader>
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
                <SectionHeader style={{ marginBottom: "24px" }}>
                  Checagem por Responsável
                </SectionHeader>
                <Spin spinning={isLoading}>
                  <ChartCard className={`${isLoading ? "loading" : ""}`}>
                    <ChartResponsibles
                      reportData={reportData}
                      isLoading={isLoading}
                    />
                  </ChartCard>
                </Spin>
              </Col>
              <Col xs={24} lg={12}>
                <div className="page-break"></div>
                <SectionHeader style={{ marginBottom: "24px" }}>
                  Checagem por Segmento
                </SectionHeader>
                <Spin spinning={isLoading}>
                  <ChartCard className={`${isLoading ? "loading" : ""}`}>
                    <ChartSegments
                      reportData={reportData}
                      isLoading={isLoading}
                    />
                  </ChartCard>
                </Spin>
              </Col>
              <Col xs={24} lg={12}>
                <div className="page-break"></div>
                <SectionHeader style={{ marginBottom: "24px" }}>
                  Top 20 Setores
                </SectionHeader>
                <Spin spinning={isLoading}>
                  <ChartCard className={`${isLoading ? "loading" : ""}`}>
                    <ChartDepartments
                      reportData={reportData}
                      isLoading={isLoading}
                    />
                  </ChartCard>
                </Spin>
              </Col>
            </Row>
          </Space>
        </div>
      </ReportContainer>
    </>
  );
}
