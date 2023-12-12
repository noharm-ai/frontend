import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { Row, Col, Space, Spin } from "antd";

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

export default function InterventionReport() {
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
          <h1 className="page-header-title">Relatório Geral: Intervenções</h1>
          <div className="page-header-legend">Métricas de Intervenções</div>
        </div>
      </PageHeader>

      <ReportContainer>
        <Filter printRef={printRef} />

        <div ref={printRef}>
          <ReportHeader className="report-header">
            <h1>Relatório Geral: Intervenções</h1>
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
                        <div className="stats-title">Passível de Aceite</div>
                        <div className="stats-value">
                          {reportData?.totals?.totalAccountable.toLocaleString() ||
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
                  <Col xs={12}>
                    <Spin spinning={isLoading}>
                      <StatsCard className={`orange `}>
                        <div className="stats-title">Pendentes</div>
                        <div className="stats-value">
                          {reportData?.totals?.totalPending.toLocaleString() ||
                            "-"}
                        </div>
                      </StatsCard>
                    </Spin>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Space>
        </div>
      </ReportContainer>
    </>
  );
}
