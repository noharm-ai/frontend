import { useSelector } from "react-redux";
import { Spin } from "antd";

import { PageHeader } from "styles/PageHeader.style";
import { ReportFilterContainer } from "styles/Report.style";
import Filter from "./Filter/Filter";
import { filtersToDescription } from "utils/report";
import CheckedIndexList from "./CheckedIndexList/CheckedIndexList";

interface CheckedIndexReportProps {
  idPrescriptionDrug: string;
  data: any;
}

export function CheckedIndexReport({
  idPrescriptionDrug,
  data,
}: CheckedIndexReportProps) {
  const status = useSelector(
    (state: any) => state.reportsArea.checkedIndex.status,
  );
  const filteredStatus = useSelector(
    (state: any) => state.reportsArea.checkedIndex.filtered.status,
  );
  const filters = useSelector(
    (state: any) => state.reportsArea.checkedIndex.filters,
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
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Histórico de Checagem</h1>
          <div style={{ fontSize: "12px", opacity: 0.7 }}>{data?.drug}</div>
        </div>
      </PageHeader>

      <Filter idPrescriptionDrug={idPrescriptionDrug} />

      <div>
        <ReportFilterContainer>
          <div
            className="report-filter-list"
            dangerouslySetInnerHTML={{
              __html: filtersToDescription(filters, filtersConfig),
            }}
          ></div>
        </ReportFilterContainer>

        <Spin spinning={isLoading}>
          <CheckedIndexList />
        </Spin>
      </div>
    </>
  );
}
