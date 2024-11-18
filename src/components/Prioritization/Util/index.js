export const PAGE_SIZE = 24;
export const ORDER_OPTIONS = [
  {
    label: "Escore global",
    key: "globalScore",
    formattedKey: "globalScore",
    type: "number",
  },
  {
    label: "Variação - Escore global",
    key: "scoreVariation",
    formattedKey: "scoreVariationString",
    type: "number",
  },
  {
    label: "Idade",
    key: "birthdays",
    formattedKey: "age",
    type: "number",
  },
  {
    label: "Exames alterados",
    key: "alertExams",
    formattedKey: "alertExams",
    type: "number",
  },
  {
    label: "Alertas na prescrição",
    key: "alerts",
    formattedKey: "alerts",
    type: "number",
  },
  {
    label: "Eventos adversos",
    key: "complication",
    formattedKey: "complication",
    type: "number",
  },
  {
    label: "Antimicrobianos",
    key: "am",
    formattedKey: "am",
    type: "number",
  },
  {
    label: "Alta vigilância",
    key: "av",
    formattedKey: "av",
    type: "number",
  },
  {
    label: "Controlados",
    key: "controlled",
    formattedKey: "controlled",
    type: "number",
  },
  {
    label: "Não padronizados",
    key: "np",
    formattedKey: "np",
    type: "number",
  },
  {
    label: "Alerta de sonda",
    key: "tube",
    formattedKey: "tube",
    type: "number",
  },
  {
    label: "Diferentes",
    key: "diff",
    formattedKey: "diff",
    type: "number",
  },
  {
    label: "Intervenções pendente",
    key: "interventions",
    formattedKey: "interventions",
    type: "number",
  },
  {
    label: "Escore prescrição",
    key: "prescriptionScore",
    formattedKey: "prescriptionScore",
    type: "number",
  },
  {
    label: "Tempo de internação",
    key: "lengthStay",
    formattedKey: "lengthStay",
    type: "number",
  },
  {
    label: "Leito",
    key: "bed",
    formattedKey: "bed",
    type: "string",
  },
  {
    label: "Anotações",
    key: "observation",
    formattedKey: "filled",
    type: "filled",
  },
].sort((a, b) => a.label.localeCompare(b.label));

export const getListStats = (list) => {
  const listStats = {
    checked: 0,
    pending: 0,
    all: list.length,
  };

  list.forEach((item) => {
    if (item.status === "s") {
      listStats.checked += 1;
    } else {
      listStats.pending += 1;
    }
  });

  return listStats;
};

export const filterList = (list, filter) => {
  let newList = [...list];
  if (filter.status) {
    newList = newList.filter((i) => i.status === filter.status);
  }

  if (filter.searchKey) {
    newList = newList.filter(
      (i) =>
        i.namePatient.toLowerCase().includes(filter.searchKey) ||
        `${i.admissionNumber}`.includes(filter.searchKey) ||
        `${i.idPatient}`.includes(filter.searchKey)
    );
  }

  return newList;
};

export const sortList = (list, orderBy, orderDirection) => {
  const orderConfig = ORDER_OPTIONS.find((o) => o.key === orderBy);
  const sortString = (a, b) => {
    const compare = `${a[orderBy]}`.localeCompare(`${b[orderBy]}`);
    if (compare === 0) {
      return a["globalScore"] - b["globalScore"];
    }

    return compare;
  };

  const sortNumber = (a, b) => {
    const compare = a[orderBy] - b[orderBy];
    if (compare === 0) {
      return a["globalScore"] - b["globalScore"];
    }

    return compare;
  };

  const sortFilled = (a, b) => {
    const a1 = { ...a };
    const b1 = { ...b };
    a1[orderBy] = a1[orderBy] ? "2filled" : "1unfilled";
    b1[orderBy] = b1[orderBy] ? "2filled" : "1unfilled";

    return sortString(a1, b1);
  };

  if (orderConfig.type === "filled") {
    if (orderDirection === "desc") {
      return list.sort((a, b) => sortFilled(b, a));
    }

    return list.sort((a, b) => sortFilled(a, b));
  }

  if (orderConfig.type === "number") {
    if (orderDirection === "desc") {
      return list.sort((a, b) => sortNumber(b, a));
    }

    return list.sort((a, b) => sortNumber(a, b));
  }

  if (orderDirection === "desc") {
    return list.sort((a, b) => sortString(a, b));
  }

  return list.sort((a, b) => sortString(b, a));
};
