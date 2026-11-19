// a screening alert as the alerts card lists it: an alertsComplete entry of a
// prescription item (or a protocol alert) joined with the item's data by
// utils/transformers/prescriptions
export interface AlertListItem {
  rowKey: string;
  idPrescriptionDrug: string;
  // drugAlertType: maxDose, kidney, liver, it (interaction), protocolGeneral...
  type: string;
  level: "high" | "medium" | "low";
  text: string;
  drugName: string;
  expire?: string | null;
  dose?: number | string | null;
  measureUnit?: { value: string; label: string } | null;
  frequency?: { value: string; label: string } | null;
  route?: string | null;
}

export interface AlertListFilters {
  levelList: string[];
  drugList: string[];
  typeList: string[];
}

export interface AlertListReportData {
  list: AlertListItem[];
}

const filterDatasource = (
  datasource: AlertListItem[],
  filters: AlertListFilters,
): AlertListItem[] => {
  return datasource
    .filter((i) => {
      if (filters.drugList.length) {
        return filters.drugList.indexOf(i.drugName) !== -1;
      }

      return true;
    })
    .filter((i) => {
      if (filters.levelList.length) {
        return filters.levelList.indexOf(i.level) !== -1;
      }

      return true;
    })
    .filter((i) => {
      if (filters.typeList.length) {
        return filters.typeList.indexOf(i.type) !== -1;
      }

      return true;
    });
};

export const getReportData = (
  datasource: AlertListItem[],
  filters: AlertListFilters,
): AlertListReportData => {
  const filteredList = filterDatasource(datasource, filters);

  const reportData = {
    list: filteredList,
  };

  return reportData;
};
