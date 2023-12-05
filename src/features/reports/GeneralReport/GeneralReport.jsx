import React from "react";
import { useSelector } from "react-redux";
import { Row, Col, Space, Spin } from "antd";

import { PageHeader } from "styles/PageHeader.style";
import { PageContainer } from "styles/Utils.style";
import { StatsCard, ChartCard, SectionHeader } from "styles/Report.style";
import Filter from "./Filter/Filter";
import ChartPrescriptionDay from "./Charts/ChartPrescriptionDay";
import ChartResponsibles from "./Charts/ChartResponsibles";
import ChartDepartments from "./Charts/ChartDepartments";

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
                    {reportData?.prescriptionTotals?.checkedPercentage || "-"}%
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
                  <div className="stats-title">Percentual de Itens</div>
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
          </Row>

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
            <Col xs={25} lg={12}>
              <SectionHeader style={{ marginBottom: "24px" }}>
                Responsáveis
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
            <Col xs={25} lg={12}>
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
      </PageContainer>
    </>
  );
}
