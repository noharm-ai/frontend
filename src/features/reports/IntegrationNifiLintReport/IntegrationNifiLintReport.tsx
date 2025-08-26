import { useRef } from "react";
import { Spin } from "antd";

import { useAppSelector } from "src/store";
import { PageHeader } from "styles/PageHeader.style";
import { ReportHeader, ReportFilterContainer } from "styles/Report.style";
import Filter from "./Filter/Filter";
import { NoHarmLogoHorizontal as Brand } from "src/assets/NoHarmLogoHorizontal";
import { filtersToDescription } from "utils/report";
import { HistoryList } from "./HistoryList/HistoryList";
import { formatDateTime } from "src/utils/date";

export function IntegrationNifiLintReport() {
  const status = useAppSelector(
    (state) => state.reportsArea.integrationNifiLint.status
  );
  const updatedAt = useAppSelector(
    (state) => state.reportsArea.integrationNifiLint.date
  );
  const filteredStatus = useAppSelector(
    (state) => state.reportsArea.integrationNifiLint.filtered.status
  );
  const filters = useAppSelector(
    (state) => state.reportsArea.integrationNifiLint.filters
  );
  const printRef = useRef(null);
  const isLoading = status === "loading" || filteredStatus === "loading";
  const filtersConfig = {
    levelList: {
      label: "Níveis",
      type: "list",
    },
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">NifiLint </h1>
          {updatedAt && (
            <div className="page-header-legend">
              Atualizado em: {formatDateTime(updatedAt)}
            </div>
          )}
        </div>
      </PageHeader>

      <Filter />

      <div ref={printRef}>
        <ReportHeader className="report-header">
          <h1>NifiLint</h1>
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

        <Spin spinning={isLoading}>
          <HistoryList />
        </Spin>
      </div>
    </>
  );
}
