import { useSelector } from "react-redux";
import { Row, Col, Space, Spin } from "antd";

import { PageHeader } from "styles/PageHeader.style";
import { ReportContainer, ReportFilterContainer } from "styles/Report.style";
import Filter from "./Filter/Filter";
import { filtersToDescription } from "utils/report";
import ObservationsList from "./ObservationsList/ObservationsList";

interface Prescription {
  admissionNumber: string;
}

interface PatientObservationReportProps {
  prescription: Prescription;
}

export default function PatientObservationReport({
  prescription,
}: PatientObservationReportProps) {
  const status = useSelector(
    (state: any) => state.reportsArea.patientObservation.status,
  );
  const filteredStatus = useSelector(
    (state: any) => state.reportsArea.patientObservation.filtered.status,
  );
  const filters = useSelector(
    (state: any) => state.reportsArea.patientObservation.filters,
  );
  const isLoading = status === "loading" || filteredStatus === "loading";
  const filtersConfig = {
    dateRange: {
      label: "Período",
      type: "range" as const,
    },
    createdByList: {
      label: "Criado por",
      type: "list" as const,
    },
    textString: {
      label: "Texto",
      type: "string" as const,
    },
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">
            Histórico de Anotações - Atendimento {prescription.admissionNumber}
          </h1>
        </div>
      </PageHeader>

      <ReportContainer>
        <Filter admissionNumber={prescription.admissionNumber} />

        <div>
          <ReportFilterContainer>
            <div
              className="report-filter-list"
              dangerouslySetInnerHTML={{
                __html: filtersToDescription(filters, filtersConfig),
              }}
            ></div>
          </ReportFilterContainer>
          <Space orientation="vertical" size="large">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={24}>
                <Space orientation="vertical" size="large">
                  <Spin spinning={isLoading}>
                    <ObservationsList />
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
