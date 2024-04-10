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
import HelpModal from "./Help/Help";
import { setHelpModal } from "./EconomyReportSlice";
import Tooltip from "components/Tooltip";
import { formatCurrency } from "utils/number";
import EconomyList from "./EconomyList/EconomyList";
import ChartResponsibles from "./Charts/ChartResponsibles";
import ChartDepartments from "./Charts/ChartDepartments";

export default function EconomyReport() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reportData = useSelector(
    (state) => state.reportsArea.economy.filtered.result
  );
  const status = useSelector((state) => state.reportsArea.economy.status);
  const filteredStatus = useSelector(
    (state) => state.reportsArea.economy.filtered.status
  );
  const filters = useSelector((state) => state.reportsArea.economy.filters);
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
    reasonList: {
      label: "Motivo",
      type: "list",
    },
    originDrugList: {
      label: "Medicamento origem",
      type: "list",
    },
    destinyDrugList: {
      label: "Medicamento substituto",
      type: "list",
    },
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">
            Relatório: Farmacoeconomia{" "}
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
          <div className="page-header-legend">
            Redução de custo gerada a partir das intervenções
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
            <h1>Relatório: Farmacoeconomia</h1>
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
              <Col xs={24}>
                <Row gutter={[24, 24]}>
                  <Col xs={12}>
                    <Spin spinning={isLoading}>
                      <StatsCard className={`blue `}>
                        <div className="stats-title">Economia</div>
                        <div className="stats-value">
                          R$ {formatCurrency(reportData?.totals?.economy)}
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
                    <h2>Economia por Responsável</h2>
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
                    <h2>Desfecho por Setor</h2>
                    <div>Totais por setor. Limitado em 20 setores.</div>
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
              <Col xs={24} lg={24}>
                <div className="page-break"></div>
                <Space direction="vertical" size="large">
                  <SectionHeader>
                    <h2>Tabela Descritiva</h2>
                    <div>Análise detalhada da economia.</div>
                  </SectionHeader>
                  <Spin spinning={isLoading}>
                    <ChartCard className={`${isLoading ? "loading" : ""}`}>
                      <EconomyList />
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
