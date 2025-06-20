import dayjs from "dayjs";

import { intersection } from "utils/lodash";
import { getUniqList, exportCSV } from "utils/report";

const STATUSES = ["a", "j", "n", "x", "s"];
export const STATUS_COLORS = {
  a: "#90BF71",
  j: "#69C1CD",
  n: "#E6744E",
  x: "#ccc",
  s: "#FACA5A",
};

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
      if (filters.drugList.length) {
        return filters.drugList.indexOf(i.drug) !== -1;
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
        return intersection(filters.reasonList, i.reason).length > 0;
      }

      return true;
    })
    .filter((i) => {
      const attrs = [
        "attrAntimicro",
        "attrMav",
        "attrControl",
        "attrNotStandard",
        "attrQuimio",
      ];
      const drugAttrs = [];

      attrs.forEach((a) => {
        if (i[a]) {
          drugAttrs.push(a);
        }
      });

      if (filters.drugAttrList.length) {
        return intersection(filters.drugAttrList, drugAttrs).length > 0;
      }

      return true;
    })
    .filter((i) => {
      if (filters.interventionType === "p") {
        return i.idPrescription !== "0";
      }

      if (filters.interventionType === "d") {
        return i.idPrescription === "0";
      }

      return true;
    })
    .filter((i) => {
      if (filters.cost === true || filters.cost === false) {
        return i.cost === filters.cost;
      }

      return true;
    })
    .filter((i) => {
      if (
        filters.prescriptionError === true ||
        filters.prescriptionError === false
      ) {
        return i.error === filters.prescriptionError;
      }

      return true;
    })
    .filter((i) => {
      if (filters.prescriberList.length) {
        return filters.prescriberList.indexOf(i.prescriber) !== -1;
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
        color: STATUS_COLORS[name],
        total: status[name],
        value: ((status[name] * 100) / total).toFixed(1),
      };
    });
};

const getReasonSummary = (datasource) => {
  const reasons = getUniqList(datasource, "reason");

  const summary = reasons.map((r) => {
    const totals = { all: 0 };
    STATUSES.forEach((s) => {
      totals[s] = 0;
    });

    datasource.forEach((i) => {
      if (i.reason.indexOf(r) !== -1) {
        totals.all += 1;

        STATUSES.forEach((s) => {
          totals[s] += i.status === s ? 1 : 0;
        });
      }
    });

    return {
      name: r,
      totals,
    };
  });

  return summary.sort((a, b) => a.totals.all - b.totals.all);
};

const getResponsibleSummary = (datasource) => {
  const responsibles = getUniqList(datasource, "responsible");

  const summary = responsibles.map((r) => {
    const totals = { all: 0 };
    STATUSES.forEach((s) => {
      totals[s] = 0;
    });

    datasource.forEach((i) => {
      if (i.responsible === r) {
        totals.all += 1;

        STATUSES.forEach((s) => {
          totals[s] += i.status === s ? 1 : 0;
        });
      }
    });

    return {
      name: r,
      totals,
    };
  });

  return summary.sort((a, b) => a.totals.all - b.totals.all);
};

const getDepartmentSummary = (datasource) => {
  const departments = getUniqList(datasource, "department");

  const summary = departments.map((d) => {
    const totals = { all: 0 };
    STATUSES.forEach((s) => {
      totals[s] = 0;
    });

    datasource.forEach((i) => {
      if (i.department === d) {
        totals.all += 1;

        STATUSES.forEach((s) => {
          totals[s] += i.status === s ? 1 : 0;
        });
      }
    });

    return {
      name: d,
      totals,
    };
  });

  return summary
    .sort((a, b) => b.totals.all - a.totals.all)
    .slice(0, 20)
    .reverse();
};

const getDrugSummary = (datasource) => {
  const drugs = getUniqList(datasource, "drug").filter((i) => i !== null);

  const summary = drugs.map((r) => {
    const totals = { all: 0 };
    STATUSES.forEach((s) => {
      totals[s] = 0;
    });

    datasource.forEach((i) => {
      if (i.drug === r) {
        totals.all += 1;

        STATUSES.forEach((s) => {
          totals[s] += i.status === s ? 1 : 0;
        });
      }
    });

    return {
      name: r,
      totals,
    };
  });

  return summary.sort((a, b) => a.totals.all - b.totals.all);
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
    reasonSummary: getReasonSummary(filteredList),
    responsibleSummary: getResponsibleSummary(filteredList),
    drugSummary: getDrugSummary(filteredList),
    departmentSummary: getDepartmentSummary(filteredList),
  };

  return reportData;
};

export const filterAndExportCSV = (datasource, filters, t) => {
  const items = filterDatasource(datasource, filters);

  return exportCSV(items, t);
};
