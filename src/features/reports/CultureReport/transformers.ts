import type { Dayjs } from "dayjs";

// a drug of the antibiogram of a collection
export interface CultureReportDrug {
  drug?: string | null;
  // sensitivity as the lab reports it (Sensível, Resistente...)
  result?: string | null;
  // MIC (minimum inhibitory concentration)
  microorganismAmount?: string | number | null;
  microorganism?: string | null;
}

// the predicted sensitivity of a drug for a collection still pending
export interface CultureReportPrediction {
  drug?: string | null;
  // R (resistant) or S (susceptible)
  prediction?: string | null;
  // 0 to 1
  probability: number;
}

// a culture collection as GET /reports/culture lists it
export interface CultureReportItem {
  key: string | number;
  id?: number | string | null;
  idExamItem?: number | string | null;
  collectionDate?: string | null;
  releaseDate?: string | null;
  examName?: string | null;
  examMaterialName?: string | null;
  // HTML from the lab
  previousResult?: string | null;
  microorganism?: string | null;
  colony?: string | null;
  gram?: string | null;
  extraInfo?: string | null;
  cultures: CultureReportDrug[];
  predictions: CultureReportPrediction[];
}

export interface CultureReportFilters {
  // antd's RangePicker clears to null
  dateRange: Dayjs[] | null;
  examNameList: string[];
  examMaterialNameList: string[];
  microorganismList: string[];
}

export interface CultureReportData {
  list: CultureReportItem[];
}

const filterDatasource = (
  datasource: CultureReportItem[],
  filters: CultureReportFilters,
): CultureReportItem[] => {
  return datasource
    .filter((i) => {
      if (filters.dateRange && filters.dateRange.length) {
        // the date strings compare as the JS did: a missing date is out
        const collectionDate = i.collectionDate as string;
        return (
          collectionDate >=
            filters.dateRange[0].format("YYYY-MM-DDT00:00:00") &&
          collectionDate <= filters.dateRange[1].format("YYYY-MM-DDT23:59:59")
        );
      }

      return true;
    })
    .filter((i) => {
      if (filters.examNameList.length) {
        return filters.examNameList.indexOf(i.examName as string) !== -1;
      }

      return true;
    })
    .filter((i) => {
      if (filters.examMaterialNameList.length) {
        return (
          filters.examMaterialNameList.indexOf(i.examMaterialName as string) !==
          -1
        );
      }

      return true;
    })

    .filter((i) => {
      if (filters.microorganismList.length) {
        return (
          filters.microorganismList.indexOf(i.microorganism as string) !== -1
        );
      }

      return true;
    });
};

export const getReportData = (
  datasource: CultureReportItem[],
  filters: CultureReportFilters,
): CultureReportData => {
  const filteredList = filterDatasource(datasource, filters);

  const reportData = {
    list: filteredList,
  };

  return reportData;
};
