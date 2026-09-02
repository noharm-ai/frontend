import * as patientCache from "utils/patientCache";

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
  {
    label: "Próxima prescrição",
    key: "nextPrescriptionDate",
    formattedKey: "nextPrescriptionDateFormated",
    type: "date",
  },
  {
    label: "Última prescrição",
    key: "lastPrescriptionDate",
    formattedKey: "lastPrescriptionDateFormated",
    type: "date",
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

export const PRESCRIPTION_DATES_FILTER = {
  ALL: "all",
  NEXT: "next",
  RANGE: "range",
};

// keeps agg prescriptions having at least one inner prescription date that
// matches the filter: "next" = at or after the user's machine time,
// "range" = inside the chosen [start, end] interval
export const filterByPrescriptionDates = (list, config, now = new Date()) => {
  if (
    !config ||
    !config.mode ||
    config.mode === PRESCRIPTION_DATES_FILTER.ALL
  ) {
    return list;
  }

  let start = null;
  let end = null;

  if (config.mode === PRESCRIPTION_DATES_FILTER.NEXT) {
    start = now.getTime();
  } else if (config.mode === PRESCRIPTION_DATES_FILTER.RANGE) {
    if (!config.range || (!config.range[0] && !config.range[1])) {
      return list;
    }

    start = config.range[0] ? Date.parse(config.range[0]) : null;
    end = config.range[1] ? Date.parse(config.range[1]) : null;
  }

  return list.filter((i) =>
    (i.prescriptionDates || []).some((d) => {
      const time = Date.parse(d);
      if (Number.isNaN(time)) {
        return false;
      }

      return (start === null || time >= start) && (end === null || time <= end);
    }),
  );
};

export const filterList = (list, filter) => {
  let newList = [...list];
  if (filter.status) {
    newList = newList.filter((i) => i.status === filter.status);
  }

  if (filter.prescriptionDates) {
    newList = filterByPrescriptionDates(newList, filter.prescriptionDates);
  }

  if (filter.searchKey) {
    newList = newList.filter(
      (i) =>
        (patientCache.getPatient(i.idPatient)?.name ?? "")
          .toLowerCase()
          .includes(filter.searchKey) ||
        `${i.admissionNumber}`.includes(filter.searchKey) ||
        `${i.idPatient}`.includes(filter.searchKey),
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

  const sortDate = (a, b) => {
    const compare = Date.parse(a[orderBy]) - Date.parse(b[orderBy]);
    if (compare === 0) {
      return a["globalScore"] - b["globalScore"];
    }

    return compare;
  };

  if (orderConfig.type === "filled") {
    if (orderDirection === "desc") {
      return list.sort((a, b) => sortFilled(b, a));
    }

    return list.sort((a, b) => sortFilled(a, b));
  }

  if (orderConfig.type === "date") {
    // records without the date always go last, regardless of direction
    const withDate = list.filter((i) => i[orderBy]);
    const withoutDate = list
      .filter((i) => !i[orderBy])
      .sort((a, b) => b["globalScore"] - a["globalScore"]);

    if (orderDirection === "desc") {
      return [...withDate.sort((a, b) => sortDate(b, a)), ...withoutDate];
    }

    return [...withDate.sort((a, b) => sortDate(a, b)), ...withoutDate];
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
