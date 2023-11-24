import React from "react";
import { useSelector } from "react-redux";
import { Row, Col, Space } from "antd";

import { PageHeader } from "styles/PageHeader.style";
import { PageContainer } from "styles/Utils.style";
import { StatsCard, ChartCard, SectionHeader } from "styles/Report.style";
import Filter from "./Filter/Filter";
import ChartPrescriptionDay from "./Charts/ChartPrescriptionDay";
import ChartResponsibles from "./Charts/ChartResponsibles";

export default function GeneralReport() {
  const reportData = useSelector(
    (state) => state.reportsArea.general.filtered.result
  );
  const status = useSelector((state) => state.reportsArea.general.status);
  const filteredStatus = useSelector(
    (state) => state.reportsArea.general.filtered.status
  );
  const isLoading = status === "loading" || filteredStatus === "loading";

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">
            Relatório Geral: Avaliação Clínica
          </h1>
          <div className="page-header-legend">
            Prescrições e Percentual de Checadas
          </div>
        </div>
      </PageHeader>

      <PageContainer>
        <Filter />

        <Space direction="vertical" size="large">
          <SectionHeader>Resumo</SectionHeader>
          <Row gutter={[16, 24]}>
            <Col xs={12} lg={8}>
              <StatsCard className={`blue ${isLoading ? "loading" : ""}`}>
                <div className="stats-title">Total de Prescrições</div>
                <div className="stats-value">
                  {reportData?.prescriptionTotals?.total.toLocaleString() ||
                    "-"}
                </div>
              </StatsCard>
            </Col>
            <Col xs={12} lg={8}>
              <StatsCard className={`green ${isLoading ? "loading" : ""}`}>
                <div className="stats-title">Prescrições Checadas</div>
                <div className="stats-value">
                  {reportData?.prescriptionTotals?.checked.toLocaleString() ||
                    "-"}
                </div>
              </StatsCard>
            </Col>
            <Col xs={12} lg={8}>
              <StatsCard className={`green ${isLoading ? "loading" : ""}`}>
                <div className="stats-title">Percentual de Prescrições</div>
                <div className="stats-value">
                  {reportData?.prescriptionTotals?.checkedPercentage || "-"}%
                </div>
              </StatsCard>
            </Col>
            <Col xs={12} lg={8}>
              <StatsCard className={`blue ${isLoading ? "loading" : ""}`}>
                <div className="stats-title">Total de Itens</div>
                <div className="stats-value">
                  {reportData?.itensTotals?.total.toLocaleString() || "-"}
                </div>
              </StatsCard>
            </Col>
            <Col xs={12} lg={8}>
              <StatsCard className={`green ${isLoading ? "loading" : ""}`}>
                <div className="stats-title">Itens Checados</div>
                <div className="stats-value">
                  {reportData?.itensTotals?.checked.toLocaleString() || "-"}
                </div>
              </StatsCard>
            </Col>
            <Col xs={12} lg={8}>
              <StatsCard className={`green ${isLoading ? "loading" : ""}`}>
                <div className="stats-title">Percentual de Itens</div>
                <div className="stats-value">
                  {reportData?.itensTotals?.checkedPercentage || "-"}%
                </div>
              </StatsCard>
            </Col>
            <Col xs={12} lg={8}>
              <StatsCard className={`orange ${isLoading ? "loading" : ""}`}>
                <div className="stats-title">Vidas Impactadas</div>
                <div className="stats-value">
                  {reportData?.lifes?.toLocaleString() || "-"}
                </div>
              </StatsCard>
            </Col>
          </Row>

          <SectionHeader>Prescrições por Dia</SectionHeader>
          <Row gutter={[16, 24]}>
            <Col xs={24}>
              <ChartCard className={`${isLoading ? "loading" : ""}`}>
                <ChartPrescriptionDay
                  reportData={reportData}
                  isLoading={isLoading}
                />
              </ChartCard>
            </Col>
          </Row>

          <SectionHeader>Responsáveis</SectionHeader>
          <Row gutter={[16, 24]}>
            <Col xs={12}>
              <ChartCard className={`${isLoading ? "loading" : ""}`}>
                <ChartResponsibles
                  reportData={reportData}
                  isLoading={isLoading}
                />
              </ChartCard>
            </Col>
          </Row>
        </Space>
      </PageContainer>
    </>
  );
}
