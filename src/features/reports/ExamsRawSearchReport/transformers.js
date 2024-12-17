const filterDatasource = (datasource, filters) => {
  return datasource
    .filter((i) => {
      if (filters.dateRange && filters.dateRange.length) {
        return (
          i.dateExam >= filters.dateRange[0].format("YYYY-MM-DDT00:00:00") &&
          i.dateExam <= filters.dateRange[1].format("YYYY-MM-DDT23:59:59")
        );
      }

      return true;
    })
    .filter((i) => {
      if (filters.typesList.length) {
        return filters.typesList.indexOf(i.typeExam) !== -1;
      }

      return true;
    })
    .filter((i) => {
      if (filters.valueString) {
        return i.value.includes(filters.valueString);
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
