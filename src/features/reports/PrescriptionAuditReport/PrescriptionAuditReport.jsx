import React, { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Row, Col, Space, Spin } from "antd";
import { UnorderedListOutlined, QuestionOutlined } from "@ant-design/icons";

import Button from "components/Button";
import { PageHeader } from "styles/PageHeader.style";
import {
  ChartCard,
  SectionHeader,
  ReportContainer,
  ReportHeader,
  ReportFilterContainer,
} from "styles/Report.style";
import Filter from "./Filter/Filter";
import ChartAuditDay from "./Charts/ChartAuditDay";
import ChartEventScatter from "./Charts/ChartEventScatter";
import ChartResponsibles from "./Charts/ChartResponsibles";
import ChartDepartments from "./Charts/ChartDepartments";
import { ReactComponent as Brand } from "assets/noHarm-horizontal.svg";
import { filtersToDescription } from "utils/report";
import HelpModal from "./Help/Help";
import { setHelpModal } from "./PrescriptionAuditReportSlice";
import Tooltip from "components/Tooltip";

export default function PrescriptionReport() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reportData = useSelector(
    (state) => state.reportsArea.prescriptionAudit.filtered.result
  );
  const status = useSelector(
    (state) => state.reportsArea.prescriptionAudit.status
  );
  const filteredStatus = useSelector(
    (state) => state.reportsArea.prescriptionAudit.filtered.status
  );
  const filters = useSelector(
    (state) => state.reportsArea.prescriptionAudit.filters
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
    type: {
      label: "Tipo",
      type: "dict",
    },
    eventType: {
      label: "Tipo de evento",
      type: "dict",
    },
    tagList: {
      label: "Marcadores",
      type: "list",
    },
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">
            Relatório: Auditoria{" "}
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
            Registros de ações de checagem e deschecagem de
            prescrições/pacientes.
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
            <h1>Relatório: Auditoria</h1>
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
              <h2>Ações por Dia</h2>
              <div>Ações agrupadas por dia.</div>
            </SectionHeader>
            <Row gutter={[24, 24]}>
              <Col xs={24}>
                <Spin spinning={isLoading}>
                  <ChartCard className={`${isLoading ? "loading" : ""}`}>
                    <ChartAuditDay
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
                    <h2>Ações por Responsável</h2>
                    <div>Ações agrupadas por responsável.</div>
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
                    <h2>Top 20 Setores</h2>
                    <div>Setores com maior número de ações.</div>
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
            </Row>

            <div className="page-break"></div>
            <SectionHeader>
              <h2>Distribuição de Ações</h2>
              <div>Quantidade de ações por dia e hora.</div>
            </SectionHeader>
            <Row gutter={[24, 24]}>
              <Col xs={24}>
                <Spin spinning={isLoading}>
                  <ChartCard className={`${isLoading ? "loading" : ""}`}>
                    <ChartEventScatter
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
      <HelpModal />
    </>
  );
}
