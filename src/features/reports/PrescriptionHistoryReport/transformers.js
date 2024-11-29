import { exportCSV } from "utils/report";

const filterDatasource = (datasource, filters) => {
  return datasource.filter((i) => {
    if (filters.responsibleList.length) {
      return filters.responsibleList.indexOf(i.substance) !== -1;
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
