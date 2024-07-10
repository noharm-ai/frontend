import { exportCSV } from "utils/report";

const filterDatasource = (datasource, filters) => {
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
