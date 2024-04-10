import Big from "big.js";
import dayjs from "dayjs";

import { exportCSV } from "utils/report";

const filterDatasource = (datasource, filters) => {
  return datasource
    .filter(
      (i) =>
        i.iniDate <= filters.dateRange[1].format("YYYY-MM-DD") &&
        i.endDate >= filters.dateRange[0].format("YYYY-MM-DD")
    )
    .filter((i) => {
      if (filters.responsibleList.length) {
        return filters.responsibleList.indexOf(i.responsible) !== -1;
      }

      return true;
    })
    .filter((i) => {
      if (filters.departmentList.length) {
        return filters.departmentList.indexOf(i.department) !== -1;
      }

      return true;
    })
    .filter((i) => {
      if (filters.segmentList.length) {
        return filters.segmentList.indexOf(i.segment) !== -1;
      }

      return true;
    })
    .filter((i) => {
      if (filters.originDrugList.length) {
        return filters.originDrugList.indexOf(i.originDrug) !== -1;
      }

      return true;
    })
    .filter((i) => {
      if (filters.destinyDrugList.length) {
        return filters.destinyDrugList.indexOf(i.destinyDrug) !== -1;
      }

      return true;
    })
    .filter((i) => {
      if (filters.statusList.length) {
        return filters.statusList.indexOf(i.status) !== -1;
      }

      return true;
    })
    .filter((i) => {
      if (filters.reasonList.length) {
        return filters.reasonList.indexOf(i.interventionReason) !== -1;
      }

      return true;
    })
    .filter((i) => {
      if (filters.economyType !== "") {
        return i.economyType === filters.economyType;
      }

      return true;
    });
};

const getTotals = (datasource) => {
  let economy = Big(0);

  datasource.forEach((i) => {
    economy = economy.plus(i.processed.economyValue);
  });

  return {
    economy,
  };
};

const getList = (datasource, periodStart, periodEnd) => {
  return datasource.map((i) => {
    const iniEconomyDate = i.iniDate > periodStart ? i.iniDate : periodStart;
    const endEconomyDate = i.endDate < periodEnd ? i.endDate : periodEnd;
    const dateDiff = dayjs(endEconomyDate).diff(iniEconomyDate, "days") + 1;
    const economyDays = dateDiff > 0 ? dateDiff : 0;
    const economyValue = Big(i.economyDayValue).times(Big(economyDays));

    return {
      ...i,
      processed: {
        iniEconomyDate,
        endEconomyDate,
        economyDays,
        economyValue,
      },
    };
  });
};

export const getReportData = (datasource, filters) => {
  const filteredList = filterDatasource(datasource, filters);
  const list = getList(
    filteredList,
    filters.dateRange[0].format("YYYY-MM-DD"),
    filters.dateRange[1].format("YYYY-MM-DD")
  );
  const totals = getTotals(list);

  const reportData = {
    totals,
    list,
  };

  console.log("reportdata", reportData);

  return reportData;
};

export const filterAndExportCSV = (datasource, filters, t) => {
  const items = filterDatasource(datasource, filters);

  return exportCSV(items, t);
};
