import Big from "big.js";
import dayjs from "dayjs";

import { exportCSV, getUniqList } from "utils/report";
import { intersection } from "utils/lodash";

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
        return (
          intersection(filters.reasonList, i.interventionReasonArray).length > 0
        );
      }

      return true;
    })
    .filter((i) => {
      if (filters.insuranceList.length) {
        return filters.insuranceList.indexOf(i.insurance) !== -1;
      }

      return true;
    })
    .filter((i) => {
      if (filters.economyType !== "") {
        return i.economyType === filters.economyType;
      }

      return true;
    })
    .filter((i) => {
      if (filters.economyValueType === "p") {
        return Big(i.economyDayValue).gte(Big(0));
      }

      if (filters.economyValueType === "n") {
        return Big(i.economyDayValue).lt(Big(0));
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
    let originPrice = null;
    let destinyPrice = null;

    if (!i.economyDayValueManual) {
      originPrice = i.originPriceDay
        ? Big(i.originPriceDay).times(Big(economyDays))
        : null;
      destinyPrice = i.destinyPriceDay
        ? Big(i.destinyPriceDay || 0).times(Big(economyDays))
        : null;
    }

    return {
      ...i,
      processed: {
        iniEconomyDate,
        endEconomyDate,
        economyDays,
        economyValue,
        originPrice,
        destinyPrice,
      },
    };
  });
};

const getResponsibleSummary = (datasource) => {
  const responsibles = getUniqList(datasource, "responsible");

  const summary = responsibles.map((r) => {
    const totals = { all: Big(0), suspension: Big(0), substitution: Big(0) };

    datasource.forEach((i) => {
      if (i.responsible === r) {
        totals.all = totals.all.plus(i.processed.economyValue);

        const field = i.economyType === 1 ? "suspension" : "substitution";
        totals[field] = totals[field].plus(i.processed.economyValue);
      }
    });

    return {
      name: r,
      totals,
    };
  });

  return summary.sort((a, b) => a.totals.all.minus(b.totals.all));
};

const getDepartmentSummary = (datasource) => {
  const departments = getUniqList(datasource, "department");

  const summary = departments.map((r) => {
    const totals = { all: Big(0), suspension: Big(0), substitution: Big(0) };

    datasource.forEach((i) => {
      if (i.department === r) {
        totals.all = totals.all.plus(i.processed.economyValue);

        const field = i.economyType === 1 ? "suspension" : "substitution";
        totals[field] = totals[field].plus(i.processed.economyValue);
      }
    });

    return {
      name: r,
      totals,
    };
  });

  return summary.sort((a, b) => a.totals.all.minus(b.totals.all));
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
    responsibleSummary: getResponsibleSummary(list),
    departmentsSummary: getDepartmentSummary(list),
  };

  return reportData;
};

export const filterAndExportCSV = (datasource, filters, t) => {
  const items = filterDatasource(datasource, filters);

  return exportCSV(items, t);
};
