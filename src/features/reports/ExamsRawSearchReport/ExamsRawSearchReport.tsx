import { Row, Col, Space, Spin } from "antd";

import { useAppSelector } from "src/store";
import { PageHeader } from "styles/PageHeader.style";
import { ReportContainer, ReportFilterContainer } from "styles/Report.style";
import { filtersToDescription } from "utils/report";
import { Filter } from "./Filter/Filter";
import { ExamsList } from "./ExamsList/ExamsList";

interface ExamsRawSearchReportProps {
  prescription: {
    admissionNumber: number | string;
    idPatient: number;
  };
}

export function ExamsRawSearchReport({
  prescription,
}: ExamsRawSearchReportProps) {
  const status = useAppSelector(
    (state) => state.reportsArea.examsRawSearch.status,
  );
  const filteredStatus = useAppSelector(
    (state) => state.reportsArea.examsRawSearch.filtered.status,
  );
  const filters = useAppSelector(
    (state) => state.reportsArea.examsRawSearch.filters,
  );
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
          <h1
            className="page-header-title"
            data-kb="reports.examsRawSearch.title"
          >
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
