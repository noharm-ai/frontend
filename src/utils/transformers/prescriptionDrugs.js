import isEmpty from 'lodash.isempty';

const groupPrescriptionDrugs = (list, createTotalRowFunction) => {
  const items = [];
  let currentGroup = list[0].grp_solution;
  let currentKey = list[0].key;
  list.forEach((item, index) => {
    if (item.grp_solution !== currentGroup) {
      items.push(createTotalRowFunction(item, currentGroup, currentKey));
      currentGroup = item.grp_solution;
    }

    currentKey = item.key;

    items.push(item);

    if (index === list.length - 1) {
      items.push(createTotalRowFunction(item, item.grp_solution, item.key));
    }
  });

  return items;
};

export const groupSolutions = (list, infusionList) => {
  if (list.length === 0) return list;

  const createTotalRow = (item, group, key) => {
    return {
      key: `${key}expand`,
      total: true,
      source: 'Soluções',
      handleRowExpand: item.handleRowExpand,
      weight: item.weight,
      infusion: infusionList.find(i => i.key === group)
    };
  };

  return groupPrescriptionDrugs(list, createTotalRow);
};

export const groupProcedures = list => {
  if (list.length === 0) return list;

  const createTotalRow = (item, group, key) => {
    return {
      key: `${key}expand`,
      source: 'Procedimentos',
      dividerRow: true
    };
  };

  return groupPrescriptionDrugs(list, createTotalRow);
};

export const filterWhitelistedChildren = list => {
  const isChild = i => {
    const grp = `${i.grp_solution.replace(i.idPrescription, '')}000`;

    return grp !== `${i.idPrescriptionDrug}` && i.grp_solution !== `${i.idPrescription}`;
  };

  return list.filter(i => {
    if (i.whiteList && isChild(i)) {
      console.log('removed', i);
      return false;
    }

    return true;
  });
};

export const getWhitelistedChildren = list => {
  if (isEmpty(list)) {
    return [];
  }

  const isChild = i => {
    const grp = `${i.grp_solution.replace(i.idPrescription, '')}000`;

    return grp !== `${i.idPrescriptionDrug}`;
  };

  return list.filter(i => {
    if (i.whiteList && isChild(i)) {
      return true;
    }

    return false;
  });
};
