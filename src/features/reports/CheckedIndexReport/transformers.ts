import { Dayjs } from "dayjs";

interface CheckedIndexData {
  doseconv: number;
  frequenciadia: number;
  idPrescription: string;
  createdAt: string;
  createdBy: string;
}

interface Filters {
  dateRange?: Dayjs[];
  createdByList: string[];
}

interface ReportData {
  list: CheckedIndexData[];
}

const filterDatasource = (
  datasource: CheckedIndexData[],
  filters: Filters,
): CheckedIndexData[] => {
  return datasource
    .filter((i) => {
      if (filters.dateRange && filters.dateRange.length) {
        return (
          i.createdAt >= filters.dateRange[0].format("YYYY-MM-DDT00:00:00") &&
          i.createdAt <= filters.dateRange[1].format("YYYY-MM-DDT23:59:59")
        );
      }

      return true;
    })
    .filter((i) => {
      if (filters.createdByList.length) {
        return filters.createdByList.indexOf(i.createdBy) !== -1;
      }

      return true;
    });
};

export const getReportData = (
  datasource: CheckedIndexData[],
  filters: Filters,
): ReportData => {
  const filteredList = filterDatasource(datasource, filters);

  const reportData: ReportData = {
    list: filteredList,
  };

  return reportData;
};
