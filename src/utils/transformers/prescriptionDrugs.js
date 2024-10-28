import isEmpty from "lodash.isempty";
import { parseISO, differenceInMinutes } from "date-fns";

export const groupComponents = (list, infusion) => {
  if (!list || list.length < 1) return list;

  let items = [];
  const cpoelist = sortPrescriptionDrugs([...list]);
  const cpoeGroups = {};
  const order = new Set();

  for (let i = 0; i < cpoelist.length; i++) {
    const currentGroup = cpoelist[i].grp_solution
      ? `${cpoelist[i].idPrescription}-${cpoelist[i].grp_solution}`
      : cpoelist[i].idPrescriptionDrug;
    order.add(currentGroup);
    cpoeGroups[currentGroup] = cpoeGroups[currentGroup]
      ? [...cpoeGroups[currentGroup], cpoelist[i]]
      : [cpoelist[i]];
  }

  order.forEach((key) => {
    if (
      cpoeGroups[key].length > 1 ||
      (cpoeGroups[key].length === 1 && cpoeGroups[key][0].source === "solution")
    ) {
      const emptyRowStart = {
        key: `${key}expandStart`,
        idPrescription: cpoeGroups[key][0].idPrescription,
        idPrescriptionDrug: `${cpoeGroups[key][0].idPrescriptionDrug}Start`,
        source: "Medicamentos",
        dividerRow: true,
        emptyRow: true,
        startRow: true,
        solutionGroupRow: cpoeGroups[key][0].source === "solution",
      };

      const emptyRowEnd = {
        key: `${key}expandEnd`,
        idPrescription: cpoeGroups[key][0].idPrescription,
        idPrescriptionDrug: `${cpoeGroups[key][0].idPrescriptionDrug}End`,
        source: "Medicamentos",
        dividerRow: true,
        emptyRow: true,
        endRow: true,
        solutionGroupRow: cpoeGroups[key][0].source === "solution",
      };
      const groupRows = cpoeGroups[key].map((g) => ({
        ...g,
        groupRow: true,
        solutionGroupRow: cpoeGroups[key][0].source === "solution",
      }));

      if (cpoeGroups[key][0].source === "solution") {
        const solutionCalcRow = {
          key: `${key}solutionCalc`,
          idPrescription: cpoeGroups[key][0].idPrescription,
          idPrescriptionDrug: `${cpoeGroups[key][0].idPrescriptionDrug}SolutionEnd`,
          total: true,
          source: "Medicamentos",
          handleRowExpand: cpoeGroups[key][0].handleRowExpand,
          weight: cpoeGroups[key][0].weight,
          infusion: infusion ? infusion[cpoeGroups[key][0].infusionKey] : {},
          emptyRow: true,
          groupRow: true,
          cpoe: cpoeGroups[key][0].cpoe,
          group: "",
          solutionGroupRow: true,
        };

        items = [
          ...items,
          emptyRowStart,
          ...groupRows,
          solutionCalcRow,
          emptyRowEnd,
        ];
      } else {
        items = [...items, emptyRowStart, ...groupRows, emptyRowEnd];
      }
    } else {
      items = [...items, ...cpoeGroups[key]];
    }
  });

  return items;
};

export const isWhitelistedChild = (
  whitelist,
  groupSolution,
  idPrescriptionDrug
) => {
  if (!whitelist) {
    return false;
  }

  if (!groupSolution) {
    return false;
  }

  return true;
};

const hasParent = (list, groupSolution) => {
  const obj = list.find(
    (i) => `${i.grp_solution}` === `${groupSolution}` && !i.whiteList
  );

  return obj != null;
};

export const filterWhitelistedChildren = (list) => {
  if (list && list.length === 1) return list;

  return list.filter((i) => {
    if (
      isWhitelistedChild(i.whiteList, i.grp_solution, i.idPrescriptionDrug) &&
      hasParent(list, i.grp_solution)
    ) {
      console.debug("removed", i);
      return false;
    }

    return true;
  });
};

export const getWhitelistedChildren = (list) => {
  if (isEmpty(list)) {
    return [];
  }

  return list.filter((i) => {
    if (isWhitelistedChild(i.whiteList, i.grp_solution, i.idPrescriptionDrug)) {
      return true;
    }

    return false;
  });
};

const sortPrescriptionDrugs = (items) => {
  const whitelistItems = items
    .filter((i) => i.whiteList)
    .sort((a, b) => `${a.drug}`.localeCompare(`${b.drug}`));

  return items
    .filter((i) => !i.emptyRow && !i.whiteList)
    .sort((a, b) => `${a.drug}`.localeCompare(`${b.drug}`))
    .concat(whitelistItems);
};

const hasAlertLevel = (alerts, level) => {
  if (alerts && alerts.length) {
    return alerts.findIndex((a) => a.level === level) !== -1;
  }

  return false;
};

const hasAlertType = (alerts, type) => {
  if (alerts && alerts.length) {
    return alerts.findIndex((a) => a.type === type) !== -1;
  }

  return false;
};

export const filterPrescriptionDrugs = (items, headers, filters) => {
  if (filters && filters.length && items) {
    return items.filter((i) => {
      let show = false;

      if (
        filters.indexOf("alertsAll_level") !== -1 ||
        filters.indexOf("alertsAll_type") !== -1
      ) {
        show = show || (i.alertsComplete && i.alertsComplete.length > 0);
      }

      if (filters.indexOf("alertsHigh") !== -1) {
        show = show || hasAlertLevel(i.alertsComplete, "high");
      }

      if (filters.indexOf("alertsMedium") !== -1) {
        show = show || hasAlertLevel(i.alertsComplete, "medium");
      }

      if (filters.indexOf("alertsLow") !== -1) {
        show = show || hasAlertLevel(i.alertsComplete, "low");
      }

      if (filters.indexOf("diff") !== -1) {
        show = show || !i.checked;
      }

      if (filters.indexOf("am") !== -1) {
        show = show || i.am;
      }

      if (filters.indexOf("hv") !== -1) {
        show = show || i.av;
      }

      if (filters.indexOf("controlled") !== -1) {
        show = show || i.c;
      }

      if (filters.indexOf("np") !== -1) {
        show = show || i.np;
      }

      if (filters.indexOf("fallRisk") !== -1) {
        show = show || i.drugAttributes?.fallRisk;
      }

      if (filters.indexOf("liver") !== -1) {
        const minValue = 150;
        show = show || i.drugAttributes?.liver > minValue;
      }

      if (filters.indexOf("withValidation") !== -1) {
        show = show || !i.whiteList;
      }

      if (filters.indexOf("active") !== -1) {
        show = show || !i.suspended;

        if (i.cpoe || headers[i.cpoe]) {
          show = show || isActive(headers[i.cpoe]);
        }
      }

      filters.forEach((f) => {
        if (f.indexOf("drugAlertType.") !== -1) {
          show = show || hasAlertType(i.alertsComplete, f.split(".")[1]);
        }
      });

      return show;
    });
  }

  return items;
};

const isActive = (header) => {
  const prescriptionDate = parseISO(header.date);
  const currentDate = new Date();

  if (differenceInMinutes(currentDate, prescriptionDate) < 0) {
    return false;
  }

  if (header.expire) {
    const expirationDate = parseISO(header.expire);

    if (differenceInMinutes(expirationDate, currentDate) < 0) {
      return false;
    }
  }

  return true;
};
