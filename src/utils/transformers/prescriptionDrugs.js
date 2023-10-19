import isEmpty from "lodash.isempty";

const groupPrescriptionDrugs = (list, createTotalRowFunction) => {
  const items = [];
  let currentGroup = list[0].grp_solution;
  let currentInfusionKey = list[0].infusionKey;
  let currentKey = list[0].key;
  list.forEach((item, index) => {
    if (item.grp_solution !== currentGroup) {
      items.push(
        createTotalRowFunction(
          item,
          currentGroup,
          currentKey,
          currentInfusionKey
        )
      );
      currentGroup = item.grp_solution;
    }

    currentKey = item.key;
    currentInfusionKey = item.infusionKey;

    items.push(item);

    if (index === list.length - 1) {
      items.push(
        createTotalRowFunction(
          item,
          item.grp_solution,
          item.key,
          item.infusionKey
        )
      );
    }
  });

  return items;
};

export const groupComponents = (list) => {
  if (!list || list.length < 1) return list;

  let items = [];
  const cpoelist = [...list];
  const cpoeGroups = {};
  const order = new Set();

  for (let i = 0; i < cpoelist.length; i++) {
    const currentGroup =
      cpoelist[i].grp_solution || cpoelist[i].idPrescriptionDrug;
    order.add(currentGroup);
    cpoeGroups[currentGroup] = cpoeGroups[currentGroup]
      ? [...cpoeGroups[currentGroup], cpoelist[i]]
      : [cpoelist[i]];
  }

  order.forEach((key) => {
    if (cpoeGroups[key].length > 1) {
      const emptyRowStart = {
        key: `${key}expandStart`,
        idPrescription: cpoeGroups[key][0].idPrescription,
        idPrescriptionDrug: `${cpoeGroups[key][0].idPrescriptionDrug}Start`,
        source: "Medicamentos",
        dividerRow: true,
        emptyRow: true,
        startRow: true,
      };
      const emptyRowEnd = {
        key: `${key}expandEnd`,
        idPrescription: cpoeGroups[key][0].idPrescription,
        idPrescriptionDrug: `${cpoeGroups[key][0].idPrescriptionDrug}End`,
        source: "Medicamentos",
        dividerRow: true,
        emptyRow: true,
        endRow: true,
      };
      const groupRows = cpoeGroups[key].map((g) => ({ ...g, groupRow: true }));
      groupRows[groupRows.length - 1].groupRowLast = true;

      items = [...items, emptyRowStart, ...groupRows, emptyRowEnd];
    } else {
      items = [...items, ...cpoeGroups[key]];
    }
  });

  return items;
};

export const groupSolutions = (list, infusionList) => {
  if (list.length === 0) return list;

  const createTotalRow = (item, group, key, infusionKey) => {
    return {
      key: `${key}expand`,
      total: true,
      source: "Soluções",
      handleRowExpand: item.handleRowExpand,
      weight: item.weight,
      infusion: infusionList[infusionKey],
      emptyRow: true,
      cpoe: item.cpoe,
      group: group,
    };
  };

  return groupPrescriptionDrugs(list, createTotalRow);
};

export const groupProcedures = (list) => {
  if (list.length === 0) return list;

  const createTotalRow = (item, group, key) => {
    return {
      key: `${key}expand`,
      source: "Procedimentos",
      dividerRow: true,
      emptyRow: true,
      cpoe: item.cpoe,
    };
  };

  return groupPrescriptionDrugs(list, createTotalRow);
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

export const filterWhitelistedChildren = (list) => {
  if (list && list.length === 1) return list;

  // do not apply to cpoe
  if (list && list.length > 0 && list[0].cpoe_group) return list;

  return list.filter((i) => {
    if (isWhitelistedChild(i.whiteList, i.grp_solution, i.idPrescriptionDrug)) {
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
