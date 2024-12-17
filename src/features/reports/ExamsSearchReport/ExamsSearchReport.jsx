import React from "react";
import { useSelector } from "react-redux";
import { Row, Col, Space, Spin } from "antd";

import { PageHeader } from "styles/PageHeader.style";
import { ReportContainer, ReportFilterContainer } from "styles/Report.style";
import Filter from "./Filter/Filter";
import { filtersToDescription } from "utils/report";
import ExamsList from "./ExamsList/ExamsList";

export default function ExamsSearchReport({ prescription }) {
  const status = useSelector((state) => state.reportsArea.examsSearch.status);
  const filteredStatus = useSelector(
    (state) => state.reportsArea.examsSearch.filtered.status
  );
  const filters = useSelector((state) => state.reportsArea.examsSearch.filters);
  const isLoading = status === "loading" || filteredStatus === "loading";
  const filtersConfig = {
    dateRange: {
      label: "Período",
      type: "range",
    },
    typeList: {
      label: "Tipo",
      type: "list",
    },
    valueString: {
      label: "Resultado",
      type: "string",
    },
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">
            Relatório: Busca de Exames - Atendimento{" "}
            {prescription.admissionNumber}
          </h1>
        </div>
      </PageHeader>

      <ReportContainer>
        <Filter idPatient={prescription.idPatient} />

        <div>
          <ReportFilterContainer>
            <div
              className="report-filter-list"
              dangerouslySetInnerHTML={{
                __html: filtersToDescription(filters, filtersConfig),
              }}
            ></div>
          </ReportFilterContainer>
          <Space direction="vertical" size="large">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={24}>
                <Space direction="vertical" size="large">
                  <Spin spinning={isLoading}>
                    <ExamsList />
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
