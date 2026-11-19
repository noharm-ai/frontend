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
import { AlertList } from "./AlertList/AlertList";

interface AlertListReportProps {
  prescription: {
    admissionNumber: number | string;
    namePatient?: string;
    birthdateFormat?: string;
  };
}

export function AlertListReport({ prescription }: AlertListReportProps) {
  const status = useAppSelector((state) => state.reportsArea.alertList.status);
  const filteredStatus = useAppSelector(
    (state) => state.reportsArea.alertList.filtered.status,
  );
  const filters = useAppSelector(
    (state) => state.reportsArea.alertList.filters,
  );
  const printRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "loading" || filteredStatus === "loading";
  const filtersConfig = {
    drugList: {
      label: "Medicamento",
      type: "list",
    },
    typeList: {
      label: "Tipo",
      type: "list",
    },
    levelList: {
      label: "Nível",
      type: "list",
    },
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title" data-kb="reports.alertList.title">
            Relatório: Alertas{" "}
          </h1>
        </div>
      </PageHeader>

      <ReportContainer>
        <Filter printRef={printRef} />

        <div ref={printRef}>
          <ReportHeader className="report-header">
            <h1>Relatório: Alertas</h1>
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
                    <AlertList />
                  </Spin>
                </Space>
              </Col>
            </Row>
          </Space>
        </div>
      </ReportContainer>
      <div style={{ fontSize: "12px", opacity: 0.7 }}>
        *A quantidade de alertas de interação e duplicidade é maior no
        relatório, pois o alerta é contabilizado nas duas direções da interação.
      </div>
    </>
  );
}
