import isEmpty from "lodash.isempty";

export const groupComponents = (list, infusion) => {
  if (!list || list.length < 1) return list;

  let items = [];
  const cpoelist = [...list];
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

  const parent = `${groupSolution}000`;

  return parent !== `${idPrescriptionDrug}`;
};

const hasParent = (list, groupSolution) => {
  const obj = list.find(
    (i) => `${i.idPrescriptionDrug}` === `${groupSolution}000`
  );

  return obj != null;
};

export const filterWhitelistedChildren = (list) => {
  if (list && list.length === 1) return list;

  // do not apply to cpoe
  if (list && list.length > 0 && list[0].cpoe_group) return list;

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

export const sortCondensedPrescriptions = (items) => {
  return items
    .filter((i) => !i.emptyRow)
    .sort((a, b) => `${a.drug}`.localeCompare(`${b.drug}`));
};
