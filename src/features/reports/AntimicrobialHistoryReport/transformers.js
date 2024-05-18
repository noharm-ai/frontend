import { exportCSV } from "utils/report";

const filterDatasource = (datasource, filters) => {
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
        return filters.substanceList.indexOf(i.substance) !== -1;
      }

      return true;
    });
};

export const getReportData = (datasource, filters) => {
  const filteredList = filterDatasource(datasource, filters);

  const reportData = {
    list: filteredList,
  };

  return reportData;
};

export const filterAndExportCSV = (datasource, filters, t) => {
  const items = filterDatasource(datasource, filters);

  return exportCSV(items, t);
};
