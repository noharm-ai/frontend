import dayjs from "dayjs";
import { uniq, intersection } from "utils/lodash";

import { exportCSV, getUniqList } from "utils/report";

const filterDatasource = (datasource, filters) => {
  return datasource
    .filter(
      (i) =>
        i.date.substring(0, 10) >= filters.dateRange[0].format("YYYY-MM-DD") &&
        i.date.substring(0, 10) <= filters.dateRange[1].format("YYYY-MM-DD")
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
    })
    .filter((i) => {
      if (filters.type === "patient") {
        return i.agg;
      }

      if (filters.type === "prescription") {
        return !i.agg;
      }

      return true;
    })
    .filter((i) => {
      if (filters.eventType === "check") {
        return i.type === "checagem";
      }

      if (filters.eventType === "uncheck") {
        return i.type === "deschecagem";
      }

      return true;
    })
    .filter((i) => {
      if (filters.tagList.length) {
        return intersection(filters.tagList, i.tags).length > 0;
      }

      return true;
    });
};

const getResponsiblesSummary = (datasource) => {
  const responsibles = getUniqList(datasource, "responsible");

  const summary = responsibles.map((r) => {
    const totals = { check: 0, uncheck: 0, all: 0 };

    datasource.forEach((i) => {
      if (i.responsible === r) {
        totals.all += 1;
        totals.check += i.type === "checagem" ? 1 : 0;
        totals.uncheck += i.type === "deschecagem" ? 1 : 0;
      }
    });

    return {
      name: r,
      totals,
    };
  });

  return summary.sort((a, b) => a.totals.all - b.totals.all);
};

const getDepartmentsSummary = (datasource) => {
  const responsibles = getUniqList(datasource, "department");

  const summary = responsibles.map((r) => {
    const totals = { check: 0, uncheck: 0, all: 0 };

    datasource.forEach((i) => {
      if (i.department === r) {
        totals.all += 1;
        totals.check += i.type === "checagem" ? 1 : 0;
        totals.uncheck += i.type === "deschecagem" ? 1 : 0;
      }
    });

    return {
      name: r,
      totals,
    };
  });

  return summary
    .sort((a, b) => a.totals.all - b.totals.all)
    .slice(summary.length - 20);
};

const getAuditPlotSeries = (datasource) => {
  const days = {};
  datasource.forEach((i) => {
    const checkValue = i.type === "checagem" ? 1 : 0;
    const uncheckValue = i.type === "deschecagem" ? 1 : 0;
    const date = i.date.substring(0, 10);

    if (days[date]) {
      days[date].check += checkValue;
      days[date].uncheck += uncheckValue;
    } else {
      days[date] = {
        date: date,
        check: checkValue,
        uncheck: uncheckValue,
      };
    }
  });

  return Object.keys(days)
    .sort()
    .map((i) => {
      return {
        date: days[i].date,
        check: days[i].check,
        uncheck: days[i].uncheck,
      };
    });
};

const getEventScatter = (datasource) => {
  const data = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      data.push([day, hour, 0]);
    }
  }

  datasource.forEach((i) => {
    const date = dayjs(i.date);
    const day = date.day();
    const hour = date.hour();

    const index = day * 24 + hour;

    data[index][2] += 1;
  });

  return data;
};

export const getReportData = (datasource, filters) => {
  const filteredList = filterDatasource(datasource, filters);
  const days = uniq(
    filteredList.map((i) =>
      i.date.substring(0, 10).split("-").reverse().join("/")
    )
  );

  const reportData = {
    responsibleSummary: getResponsiblesSummary(filteredList),
    departmentSummary: getDepartmentsSummary(filteredList),
    days: days,
    auditPlotSeries: getAuditPlotSeries(filteredList),
    eventScatter: getEventScatter(filteredList),
  };

  return reportData;
};

export const filterAndExportCSV = (datasource, filters, t) => {
  const items = filterDatasource(datasource, filters);

  return exportCSV(items, t);
};
