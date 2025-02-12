import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { Row, Col, Space, Spin } from "antd";

import { PageHeader } from "styles/PageHeader.style";
import {
  ReportContainer,
  ReportHeader,
  ReportFilterContainer,
  ReportPrintDescriptions,
} from "styles/Report.style";
import Filter from "./Filter/Filter";
import { NoHarmLogoHorizontal as Brand } from "assets/NoHarmLogoHorizontal";
import { filtersToDescription } from "utils/report";
import HistoryList from "./HistoryList/HistoryList";

export default function PrescriptionHistoryReport({ prescription }) {
  const status = useSelector(
    (state) => state.reportsArea.prescriptionHistory.status
  );
  const filteredStatus = useSelector(
    (state) => state.reportsArea.prescriptionHistory.filtered.status
  );
  const filters = useSelector(
    (state) => state.reportsArea.prescriptionHistory.filters
  );
  const printRef = useRef(null);
  const isLoading = status === "loading" || filteredStatus === "loading";
  const filtersConfig = {};

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">
            Relatório: Histórico de Eventos{" "}
          </h1>
        </div>
      </PageHeader>

      <ReportContainer>
        <Filter
          printRef={printRef}
          idPrescription={prescription.idPrescription}
        />

        <div ref={printRef}>
          <ReportHeader className="report-header">
            <h1>Relatório: Histórico de Eventos</h1>
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
          <ReportPrintDescriptions>
            <div>
              <label>Atendimento</label>: {prescription.admissionNumber}
            </div>
            <div>
              <label>Paciente</label>: {prescription.namePatient}
            </div>
            <div>
              <label>Data de Nascimento</label>: {prescription.birthdateFormat}
            </div>
          </ReportPrintDescriptions>
          <Space direction="vertical" size="large">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={24}>
                <Space direction="vertical" size="large">
                  <Spin spinning={isLoading}>
                    <HistoryList />
                  </Spin>
                </Space>
              </Col>
            </Row>
          </Space>
        </div>
      </ReportContainer>
    </>
  );
}
