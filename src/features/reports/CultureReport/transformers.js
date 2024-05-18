import { exportCSV } from "utils/report";

const filterDatasource = (datasource, filters) => {
  return datasource
    .filter((i) => {
      if (filters.dateRange && filters.dateRange.length) {
        return (
          i.collectionDate >=
            filters.dateRange[0].format("YYYY-MM-DDT00:00:00") &&
          i.collectionDate <= filters.dateRange[1].format("YYYY-MM-DDT23:59:59")
        );
      }

      return true;
    })
    .filter((i) => {
      if (filters.examNameList.length) {
        return filters.examNameList.indexOf(i.examName) !== -1;
      }

      return true;
    })
    .filter((i) => {
      if (filters.examMaterialNameList.length) {
        return filters.examMaterialNameList.indexOf(i.examMaterialName) !== -1;
      }

      return true;
    })

    .filter((i) => {
      if (filters.microorganismList.length) {
        return filters.microorganismList.indexOf(i.microorganism) !== -1;
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
