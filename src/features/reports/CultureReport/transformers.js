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
  // .filter((i) => {
  //   if (filters.departmentList.length) {
  //     return filters.departmentList.indexOf(i.department) !== -1;
  //   }

  //   return true;
  // })
  // .filter((i) => {
  //   if (filters.segmentList.length) {
  //     return filters.segmentList.indexOf(i.segment) !== -1;
  //   }

  //   return true;
  // })
  // .filter((i) => {
  //   if (filters.originDrugList.length) {
  //     return filters.originDrugList.indexOf(i.originDrug) !== -1;
  //   }

  //   return true;
  // })
  // .filter((i) => {
  //   if (filters.destinyDrugList.length) {
  //     return filters.destinyDrugList.indexOf(i.destinyDrug) !== -1;
  //   }

  //   return true;
  // })
  // .filter((i) => {
  //   if (filters.statusList.length) {
  //     return filters.statusList.indexOf(i.status) !== -1;
  //   }

  //   return true;
  // })
  // .filter((i) => {
  //   if (filters.reasonList.length) {
  //     return filters.reasonList.indexOf(i.interventionReason) !== -1;
  //   }

  //   return true;
  // })
  // .filter((i) => {
  //   if (filters.insuranceList.length) {
  //     return filters.insuranceList.indexOf(i.insurance) !== -1;
  //   }

  //   return true;
  // })
  // .filter((i) => {
  //   if (filters.economyType !== "") {
  //     return i.economyType === filters.economyType;
  //   }

  //   return true;
  // })
  // .filter((i) => {
  //   if (filters.economyValueType === "p") {
  //     return Big(i.economyDayValue).gte(Big(0));
  //   }

  //   if (filters.economyValueType === "n") {
  //     return Big(i.economyDayValue).lt(Big(0));
  //   }

  //   return true;
  // });
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
