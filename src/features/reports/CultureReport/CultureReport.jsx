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
import CultureList from "./CultureList/CultureList";

export default function CultureReport({ idPatient, prescription }) {
  const status = useSelector((state) => state.reportsArea.culture.status);
  const filteredStatus = useSelector(
    (state) => state.reportsArea.culture.filtered.status
  );
  const filters = useSelector((state) => state.reportsArea.culture.filters);
  const printRef = useRef(null);
  const isLoading = status === "loading" || filteredStatus === "loading";
  const filtersConfig = {
    dateRange: {
      label: "Período",
      type: "range",
    },
    examNameList: {
      label: "Exame",
      type: "list",
    },
    examMaterialNameList: {
      label: "Material",
      type: "list",
    },
    microorganismList: {
      label: "Microorganismo",
      type: "list",
    },
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Relatório: Culturas </h1>
        </div>
      </PageHeader>

      <ReportContainer>
        <Filter printRef={printRef} idPatient={idPatient} />

        <div ref={printRef}>
          <ReportHeader className="report-header">
            <h1>Relatório: Culturas</h1>
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
                    <CultureList />
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
