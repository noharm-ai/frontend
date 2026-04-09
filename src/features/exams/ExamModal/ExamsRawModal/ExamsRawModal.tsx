import { Spin } from "antd";

import { useAppSelector } from "src/store";
import { filtersToDescription } from "utils/report";
import { ReportFilterContainer } from "styles/Report.style";
import { ExamsRawFilter } from "./Filter/ExamsRawFilter";
import { ExamsRawList } from "./ExamsRawList/ExamsRawList";

interface IExamsRawModalProps {
  admissionNumber: number;
  idSegment: number;
  active: boolean;
}

const filtersConfig = {
  dateRange: { label: "Período", type: "range" },
  typeList: { label: "Tipo", type: "list" },
  valueString: { label: "Resultado", type: "string" },
};

export function ExamsRawModal({
  admissionNumber,
  idSegment,
  active,
}: IExamsRawModalProps) {
  const status = useAppSelector(
    (state) => (state as any).examsModal.raw.status as string
  );
  const filteredStatus = useAppSelector(
    (state) => (state as any).examsModal.raw.filtered.status as string
  );
  const filters = useAppSelector(
    (state) => (state as any).examsModal.raw.filters
  );
  const isLoading = status === "loading" || filteredStatus === "loading";

  return (
    <>
      <ExamsRawFilter
        admissionNumber={admissionNumber}
        idSegment={idSegment}
        active={active}
      />

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
