export const matchPrediction = (item) =>
  item.factor &&
  item.prediction &&
  `${item.prediction}` !== `${item.factor}` &&
  item.prediction !== "Curadoria";

export const isValidConversion = (list) => {
  if (!list || !list.length) return false;

  let valid = true;
  let hasDefault = false;
  list.forEach((item) => {
    if (item.factor === null) {
      valid = false;
    }

    if (item.factor === 1) {
      hasDefault = true;
    }
  });

  return valid && hasDefault;
};

export const filterConversionList = (data, filters) => {
  if (!filters) return data;

  return data.filter((i) => {
    let hasAllConversions = true;
    let match = true;

    i.data.forEach((uc) => {
      if (!uc.factor) {
        hasAllConversions = false;
      }

      if (!matchPrediction(uc)) {
        match = false;
      }
    });

    if (filters.conversionType === "filled") {
      return hasAllConversions;
    }

    if (filters.conversionType === "empty") {
      return !hasAllConversions;
    }

    if (filters.conversionType === "mismatch") {
      return match;
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
