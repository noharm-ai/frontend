import type { Dayjs } from "dayjs";

// an exam result as GET /reports/exams/raw lists it
export interface RawExam {
  idExam: number;
  idPatient: number;
  dateExam: string;
  typeExam: string;
  value: string;
  unit?: string | null;
}

export interface ExamsRawSearchFilters {
  // antd's RangePicker clears to null
  dateRange: Dayjs[] | null;
  typesList: string[];
  valueString: string;
}

export interface ExamsRawSearchReportData {
  list: RawExam[];
}

const filterDatasource = (
  datasource: RawExam[],
  filters: ExamsRawSearchFilters,
): RawExam[] => {
  return datasource
    .filter((i) => {
      if (filters.dateRange && filters.dateRange.length) {
        return (
          i.dateExam >= filters.dateRange[0].format("YYYY-MM-DDT00:00:00") &&
          i.dateExam <= filters.dateRange[1].format("YYYY-MM-DDT23:59:59")
        );
      }

      return true;
    })
    .filter((i) => {
      if (filters.typesList.length) {
        return filters.typesList.indexOf(i.typeExam) !== -1;
      }

      return true;
    })
    .filter((i) => {
      if (filters.valueString) {
        return i.value.includes(filters.valueString);
      }

      return true;
    });
};

export const getReportData = (
  datasource: RawExam[],
  filters: ExamsRawSearchFilters,
): ExamsRawSearchReportData => {
  const filteredList = filterDatasource(datasource, filters);

  const reportData = {
    list: filteredList,
  };

  return reportData;
};
