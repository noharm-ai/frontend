import { uniq } from "utils/lodash";
import dayjs from "dayjs";

import { getUniqList, exportCSV } from "utils/report";

const getPrescriptionTotals = (datasource) => {
  const checkedPrescriptions = datasource.filter((i) => i.checked).length;

  return {
    total: datasource.length,
    checked: checkedPrescriptions,
    checkedPercentage: datasource.length
      ? ((checkedPrescriptions * 100) / datasource.length).toFixed()
      : 0,
  };
};

const getItensTotal = (datasource) => {
  const total = datasource.reduce(
    (accumulator, currentValue) => accumulator + currentValue.itens,
    0
  );

  const checked = datasource.reduce(
    (accumulator, currentValue) => accumulator + currentValue.checkedItens,
    0
  );

  return {
    total,
    checked,
    checkedPercentage: total ? ((checked * 100) / total).toFixed() : 0,
  };
};

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
    })
    .filter((i) => {
      if (filters.minScore) {
        return i.globalScore >= filters.minScore;
      }

      return true;
    })
    .filter((i) => {
      if (filters.maxScore) {
        return i.globalScore <= filters.maxScore;
      }

      return true;
    });
};

const getLifesSummary = (datasource) => {
  const total = uniq(datasource.map((i) => i.admissionNumber)).length;
  const impacted = uniq(
    datasource.filter((i) => i.checked).map((i) => i.admissionNumber)
  ).length;

  return {
    total,
    impacted,
    percentage: ((impacted * 100) / total).toFixed(),
  };
};

const getClinicalNotesTotal = (datasource) => {
  return datasource.reduce(
    (accumulator, currentValue) => accumulator + currentValue.clinicalNote,
    0
  );
};

const getResponsiblesSummary = (datasource, totalPrescriptions) => {
  const responsibles = {};
  datasource.forEach((i) => {
    if (i.checked) {
      responsibles[i.responsible] = responsibles[i.responsible]
        ? responsibles[i.responsible] + 1
        : 1;
    }
  });

  const data = Object.keys(responsibles).map((name) => {
    return {
      name,
      total: responsibles[name],
      percentage: ((responsibles[name] * 100) / totalPrescriptions).toFixed(1),
    };
  });

  return data.sort(function (a, b) {
    return a.total - b.total;
  });
};

const getSegmentsSummary = (datasource, totalPrescriptions) => {
  const segments = {};
  datasource.forEach((i) => {
    if (i.checked) {
      segments[i.segment] = segments[i.segment] ? segments[i.segment] + 1 : 1;
    }
  });

  return Object.keys(segments).map((name) => {
    return {
      name,
      value: segments[name],
      percentage: ((segments[name] * 100) / totalPrescriptions).toFixed(1),
    };
  });
};

const getDepartmentsSummary = (datasource) => {
  const departments = {};
  datasource.forEach((i) => {
    if (i.checked) {
      departments[i.department] = departments[i.department]
        ? departments[i.department] + 1
        : 1;
    }
  });

  const data = Object.keys(departments).map((name) => {
    return {
      name,
      total: departments[name],
    };
  });

  return data
    .sort(function (a, b) {
      return b.total - a.total;
    })
    .slice(0, 20)
    .reverse();
};

const getPrescriptionPlotSeries = (datasource) => {
  const days = {};
  datasource.forEach((i) => {
    if (days[i.date]) {
      days[i.date].total += 1;
      days[i.date].checked += i.checked ? 1 : 0;
    } else {
      days[i.date] = {
        date: i.date,
        total: 1,
        checked: i.checked ? 1 : 0,
      };
    }
  });

  return Object.keys(days)
    .sort()
    .map((i) => {
      return {
        date: days[i].date,
        total: days[i].total,
        checked: days[i].checked,
      };
    });
};

const getScoreSummary = (datasource) => {
  const scores = [];
  for (let s = 0; s < 4; s++) {
    scores.push({ total: 0, checked: 0 });
  }

  datasource.forEach((i) => {
    const checkedValue = i.checked ? 1 : 0;

    if (i.globalScore >= 90) {
      scores[3].total += 1;
      scores[3].checked += checkedValue;
    } else if (i.globalScore >= 60 && i.globalScore < 90) {
      scores[2].total += 1;
      scores[2].checked += checkedValue;
    } else if (i.globalScore >= 10 && i.globalScore < 60) {
      scores[1].total += 1;
      scores[1].checked += checkedValue;
    } else {
      scores[0].total += 1;
      scores[0].checked += checkedValue;
    }
  });

  return scores.map((i) => ({
    ...i,
    pending: i.total - i.checked,
    percentage: i.total ? ((i.checked * 100) / i.total).toFixed() : 0,
  }));
};

export const getReportData = (datasource, filters) => {
  const filteredList = filterDatasource(datasource, filters);
  const prescriptionTotals = getPrescriptionTotals(filteredList);
  const days = getUniqList(filteredList, "date").map((i) =>
    i.split("-").reverse().join("/")
  );

  const reportData = {
    prescriptionTotals: prescriptionTotals,
    itensTotals: getItensTotal(filteredList),
    lifes: getLifesSummary(filteredList),
    clinicalNotes: getClinicalNotesTotal(filteredList),
    responsibles: getResponsiblesSummary(
      filteredList,
      prescriptionTotals.checked
    ),
    departments: getDepartmentsSummary(filteredList),
    segments: getSegmentsSummary(filteredList, prescriptionTotals.checked),
    days: days,
    prescriptionPlotSeries: getPrescriptionPlotSeries(filteredList),
    scoreSummary: getScoreSummary(filteredList),
  };

  return reportData;
};

export const filterAndExportCSV = (datasource, filters, t) => {
  const items = filterDatasource(datasource, filters);

  return exportCSV(items, t);
};
