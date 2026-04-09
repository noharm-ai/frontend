import React from "react";
import { useSelector } from "react-redux";
import { Spin } from "antd";

import { filtersToDescription } from "utils/report";
import { ReportFilterContainer } from "styles/Report.style";
import { ExamsRawFilter } from "./Filter/ExamsRawFilter";
import { ExamsRawList } from "./ExamsRawList/ExamsRawList";

const filtersConfig = {
  dateRange: { label: "Período", type: "range" },
  typeList: { label: "Tipo", type: "list" },
  valueString: { label: "Resultado", type: "string" },
};

export function ExamsRawModal({ admissionNumber, idSegment, active }) {
  const status = useSelector((state) => state.examsModal.raw.status);
  const filteredStatus = useSelector(
    (state) => state.examsModal.raw.filtered.status,
  );
  const filters = useSelector((state) => state.examsModal.raw.filters);
  const isLoading = status === "loading" || filteredStatus === "loading";

  return (
    <>
      <ExamsRawFilter admissionNumber={admissionNumber} idSegment={idSegment} active={active} />

      <ReportFilterContainer>
        <div
          className="report-filter-list"
          dangerouslySetInnerHTML={{
            __html: filtersToDescription(filters, filtersConfig),
          }}
        />
      </ReportFilterContainer>

      <Spin spinning={isLoading}>
        <ExamsRawList />
      </Spin>
    </>
  );
}
