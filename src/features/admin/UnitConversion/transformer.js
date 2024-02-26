export const filterConversionList = (data, filters) => {
  if (!filters) return data;

  return data.filter((i) => {
    let hasAllConversions = true;

    i.data.forEach((uc) => {
      if (!uc.factor) {
        hasAllConversions = false;
      }
    });

    if (filters.hasConversion === true) {
      return hasAllConversions;
    }

    if (filters.hasConversion === false) {
      return !hasAllConversions;
    }

    return true;
  });
};

export const groupConversions = (data) => {
  const groups = {};
  for (let i = 0; i < data.length; i++) {
    const d = data[i];

    if (groups[d.idDrug]) {
      groups[d.idDrug].data.push(d);
    } else {
      groups[d.idDrug] = {
        idDrug: d.idDrug,
        name: d.name,
        idSegment: d.idSegment,
        data: [d],
      };
    }
  }

  return Object.keys(groups)
    .map((k) => groups[k])
    .sort((a, b) => `${a.name}`.trim().localeCompare(`${b.name}`.trim()));
};
