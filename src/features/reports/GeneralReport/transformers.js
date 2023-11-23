import { uniq } from "utils/lodash";

const getPrescriptionTotals = (datasource) => {
  const checkedPrescriptions = datasource.filter((i) => i.checked).length;

  return {
    total: datasource.length,
    checked: checkedPrescriptions,
    checkedPercentage: (
      (checkedPrescriptions * 100) /
      datasource.length
    ).toFixed(),
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
    checkedPercentage: ((checked * 100) / total).toFixed(),
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
    });
};

const getLifesTotal = (datasource) => {
  return uniq(datasource.filter((i) => i.checked).map((i) => i.admissionNumber))
    .length;
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

  return Object.keys(responsibles).map((name) => {
    return {
      name,
      total: responsibles[name],
      percentage: ((responsibles[name] * 100) / totalPrescriptions).toFixed(1),
    };
  });
};

export const getUniqList = (datasource, attr) => {
  return uniq(datasource.map((i) => i[attr])).sort();
};

export const getReportData = (datasource, filters) => {
  const filteredList = filterDatasource(datasource, filters);
  const prescriptionTotals = getPrescriptionTotals(filteredList);

  const reportData = {
    prescriptionTotals: prescriptionTotals,
    itensTotals: getItensTotal(filteredList),
    lifes: getLifesTotal(filteredList),
    responsibles: getResponsiblesSummary(
      filteredList,
      prescriptionTotals.checked
    ),
  };

  console.log("reportdata", reportData);

  return reportData;
};
