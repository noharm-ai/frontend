import { useRef } from "react";
import { Row, Col, Space, Spin } from "antd";

import { useAppSelector } from "src/store";
import { PageHeader } from "styles/PageHeader.style";
import {
  ReportContainer,
  ReportHeader,
  ReportFilterContainer,
  ReportPrintDescriptions,
} from "styles/Report.style";
import { Filter } from "./Filter/Filter";
import { NoHarmLogoHorizontal as Brand } from "src/assets/NoHarmLogoHorizontal";
import { filtersToDescription } from "utils/report";
import { HistoryList } from "./HistoryList/HistoryList";

interface PrescriptionHistoryReportProps {
  prescription: {
    idPrescription: number | string;
    admissionNumber: number | string;
    namePatient?: string;
    birthdateFormat?: string;
  };
}

export function PrescriptionHistoryReport({
  prescription,
}: PrescriptionHistoryReportProps) {
  const status = useAppSelector(
    (state) => state.reportsArea.prescriptionHistory.status,
  );
  const filteredStatus = useAppSelector(
    (state) => state.reportsArea.prescriptionHistory.filtered.status,
  );
  const filters = useAppSelector(
    (state) => state.reportsArea.prescriptionHistory.filters,
  );
  const printRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "loading" || filteredStatus === "loading";
  const filtersConfig = {};

  return (
    <>
      <PageHeader>
        <div>
          <h1
            className="page-header-title"
            data-kb="reports.prescriptionHistory.title"
          >
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
