import { Dayjs } from "dayjs";

interface ObservationData {
  id: string;
  text: string;
  createdBy: string;
  createdAt: string;
}

interface Filters {
  dateRange?: Dayjs[];
  createdByList: string[];
  textString?: string;
}

interface ReportData {
  list: ObservationData[];
}

const filterDatasource = (
  datasource: ObservationData[],
  filters: Filters,
): ObservationData[] => {
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
    })
    .filter((i) => {
      if (filters.textString) {
        return (
          i.text &&
          i.text.toLowerCase().includes(filters.textString.toLowerCase())
        );
      }

      return true;
    });
};

export const getReportData = (
  datasource: ObservationData[],
  filters: Filters,
): ReportData => {
  const filteredList = filterDatasource(datasource, filters);

  const reportData: ReportData = {
    list: filteredList,
  };

  return reportData;
};
