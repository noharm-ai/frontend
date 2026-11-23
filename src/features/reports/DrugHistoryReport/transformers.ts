import type { Dayjs } from "dayjs";

// a prescribed drug as GET /reports/drug-attributes/history lists it
export interface DrugHistoryItem {
  idPrescriptionDrug: number | string;
  idPrescription: number | string;
  admissionNumber: number | string;
  prescriptionDate: string;
  prescriptionExpirationDate?: string | null;
  suspensionDate?: string | null;
  drug: string;
  substance?: string | null;
  dose?: number | string | null;
  measureUnit?: string | null;
  frequency?: string | null;
  route?: string | null;
}

export interface DrugHistoryFilters {
  // antd's RangePicker clears to null
  dateRange: Dayjs[] | null;
  drugList: string[];
  substanceList: string[];
}

export interface DrugHistoryReportData {
  list: DrugHistoryItem[];
}

const filterDatasource = (
  datasource: DrugHistoryItem[],
  filters: DrugHistoryFilters,
): DrugHistoryItem[] => {
  return datasource
    .filter((i) => {
      if (filters.dateRange && filters.dateRange.length) {
        return (
          i.prescriptionDate >=
            filters.dateRange[0].format("YYYY-MM-DDT00:00:00") &&
          i.prescriptionDate <=
            filters.dateRange[1].format("YYYY-MM-DDT23:59:59")
        );
      }

      return true;
    })
    .filter((i) => {
      if (filters.drugList.length) {
        return filters.drugList.indexOf(i.drug) !== -1;
      }

      return true;
    })
    .filter((i) => {
      if (filters.substanceList.length) {
        return filters.substanceList.indexOf(i.substance as string) !== -1;
      }

      return true;
    });
};

export const getReportData = (
  datasource: DrugHistoryItem[],
  filters: DrugHistoryFilters,
): DrugHistoryReportData => {
  const filteredList = filterDatasource(datasource, filters);

  const reportData = {
    list: filteredList,
  };

  return reportData;
};
