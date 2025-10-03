import { exportCSV } from "utils/report";

const filterDatasource = (datasource: any[], filters: any) => {
  return datasource
    .filter((i) => {
      if (filters.levelList?.length) {
        return filters.levelList.indexOf(i.level) !== -1;
      }

      return true;
    })
    .filter((i) => {
      if (filters.schemaList?.length) {
        return filters.schemaList.indexOf(i.schema) !== -1;
      }

      return true;
    })
    .filter((i) => {
      if (filters.keyList?.length) {
        return filters.keyList.indexOf(i.key) !== -1;
      }

      return true;
    })
    .filter((i) => {
      if (filters.entityList?.length) {
        return filters.entityList.indexOf(i.name) !== -1;
      }

      return true;
    })
    .filter((i) => {
      if (filters.groupList?.length) {
        return filters.groupList.indexOf(i.group) !== -1;
      }

      return true;
    });
};

export const getReportData = (datasource: any[], filters: any) => {
  const filteredList = filterDatasource(datasource, filters);

  const reportData = {
    list: filteredList,
  };

  return reportData;
};

export const filterAndExportCSV = (datasource: any[], filters: any, t: any) => {
  const items = filterDatasource(datasource, filters);

  return exportCSV(items, t);
};
