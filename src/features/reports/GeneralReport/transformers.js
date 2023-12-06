import { uniq, isEmpty } from "utils/lodash";
import dayjs from "dayjs";

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

const getLifesTotal = (datasource) => {
  return uniq(datasource.filter((i) => i.checked).map((i) => i.admissionNumber))
    .length;
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
        total: 0,
        checked: 0,
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

// const getLifesPlotSeries = (datasource) => {
//   const days = {};
//   datasource.forEach((i) => {
//     if (days[i.date]) {
//       days[i.date].lifesTotal.push(i.admissionNumber);
//       if (i.checked) {
//         days[i.date].lifesChecked.push(i.admissionNumber);
//       }
//     } else {
//       days[i.date] = {
//         date: i.date,
//         lifesTotal: [],
//         lifesChecked: [],
//       };
//     }
//   });

//   return Object.keys(days)
//     .sort()
//     .map((i) => {
//       return {
//         date: days[i].date,
//         total: uniq(days[i].lifesTotal).length,
//         checked: uniq(days[i].lifesChecked).length,
//       };
//     });
// };

export const getUniqList = (datasource, attr) => {
  return uniq(datasource.map((i) => i[attr])).sort();
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
    lifes: getLifesTotal(filteredList),
    clinicalNotes: getClinicalNotesTotal(filteredList),
    responsibles: getResponsiblesSummary(
      filteredList,
      prescriptionTotals.checked
    ),
    departments: getDepartmentsSummary(filteredList),
    segments: getSegmentsSummary(filteredList, prescriptionTotals.checked),
    days: days,
    prescriptionPlotSeries: getPrescriptionPlotSeries(filteredList),
  };

  return reportData;
};

export const filtersToDescription = (filters, filtersConfig) => {
  const dateFormat = "DD/MM/YY";
  return Object.keys(filters)
    .map((k) => {
      const config = filtersConfig[k] || {
        label: k,
        type: "undefined",
      };

      if (isEmpty(filters[k])) {
        return null;
      }

      if (config?.type === "range") {
        return `<strong>${config.label}:</strong> ${dayjs(filters[k][0]).format(
          dateFormat
        )} até ${dayjs(filters[k][1]).format(dateFormat)}`;
      }

      return `<strong>${config.label}:</strong> ${filters[k]}`;
    })
    .filter((i) => i !== null)
    .concat(`<strong>Gerado em:</strong> ${dayjs().format("DD/MM/YY HH:mm")}`)
    .join(" | ");
};

export const toCSV = (datasource, filters, t) => {
  const items = filterDatasource(datasource, filters);

  const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here
  const header = Object.keys(items[0]);
  const headerNames = Object.keys(items[0]).map((k) => t(`reportcsv.${k}`));
  const csv = [
    headerNames.join(","), // header row first
    ...items.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(",")
    ),
  ].join("\r\n");

  return csv;
};
