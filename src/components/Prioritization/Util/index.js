export const PAGE_SIZE = 24;
export const ORDER_OPTIONS = [
  {
    label: "Escore global",
    key: "globalScore",
    formattedKey: "globalScore",
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
  // TODO: only for noharmcare
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
        `${i.admissionNumber}`.includes(filter.searchKey)
    );
  }

  return newList;
};

export const sortList = (list, orderBy, orderDirection) => {
  if (orderDirection === "desc") {
    return list.sort((a, b) => b[orderBy] - a[orderBy]);
  }

  return list.sort((a, b) => a[orderBy] - b[orderBy]);
};
