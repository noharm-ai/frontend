import dayjs from "dayjs";

import { getUniqList, exportCSV } from "utils/report";

const filterDatasource = (datasource, filters) => {
  return datasource
    .filter(
      (i) =>
        i.date >= filters.dateRange[0].format("YYYY-MM-DD") &&
        i.date <= filters.dateRange[1].format("YYYY-MM-DD")
    )
    .filter((i) => {
      if (filters.weekDays && [0, 6].indexOf(dayjs(i.date).day()) !== -1) {
        return false;
      }

      return true;
    })
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
    });
};

export const getTotals = (datasource) => {
  const total = datasource.length;
  let totalAccountable = 0;
  let totalDoNotApply = 0;
  let totalPending = 0;
  let totalAccepted = 0;
  let totalNotAccepted = 0;
  let totalJustified = 0;

  datasource.forEach((i) => {
    switch (i.status) {
      case "a":
        totalAccountable += 1;
        totalAccepted += 1;
        break;

      case "j":
        totalAccountable += 1;
        totalJustified += 1;
        break;

      case "n":
        totalAccountable += 1;
        totalNotAccepted += 1;
        break;

      case "s":
        totalPending += 1;
        break;

      case "x":
        totalDoNotApply += 1;
        break;

      default:
        break;
    }
  });

  return {
    total,
    totalDoNotApply,
    totalAccountable,

    totalPending,
    totalAccepted,
    totalNotAccepted,
    totalJustified,

    acceptedPercentage: totalAccountable
      ? ((totalAccepted * 100) / totalAccountable).toFixed()
      : 0,
  };
};

const getStatusSummary = (datasource, total) => {
  const status = {};
  datasource.forEach((i) => {
    status[i.status] = status[i.status] ? status[i.status] + 1 : 1;
  });

  return Object.keys(status)
    .sort()
    .map((name) => {
      return {
        name,
        total: status[name],
        value: ((status[name] * 100) / total).toFixed(1),
      };
    });
};

export const getReportData = (datasource, filters) => {
  const filteredList = filterDatasource(datasource, filters);
  const totals = getTotals(filteredList);
  const days = getUniqList(filteredList, "date").map((i) =>
    i.split("-").reverse().join("/")
  );

  const reportData = {
    totals,
    days,
    statusSummary: getStatusSummary(filteredList, totals.total),
  };

  console.log("reportdata", reportData);

  return reportData;
};

export const filterAndExportCSV = (datasource, filters, t) => {
  const items = filterDatasource(datasource, filters);

  return exportCSV(items, t);
};
