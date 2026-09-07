import * as patientCache from "utils/patientCache";
import Feature from "models/Feature";
import { getPrescriptionDatesInfo } from "utils/transformers/prescriptions";

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
    feature: Feature.PRIORITIZATION_PRESCRIPTION_DATES,
  },
].sort((a, b) => a.label.localeCompare(b.label));

// options the user can pick: the ones bound to a feature need it enabled
export const getOrderOptions = (featureService) =>
  ORDER_OPTIONS.filter(
    (o) => !o.feature || featureService.hasFeature(o.feature),
  );

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

// the time slider moves in 15 minute slots
export const TIME_SLIDER_STEP = 15;

// the prescription dates filter is only available while prioritizing by the
// next inner prescription
export const isPrescriptionDatesPrioritization = (prioritization) =>
  prioritization === "nextPrescriptionDate";

// order applied when a prioritization is picked; null keeps the current one
export const getDefaultPrioritizationOrder = (prioritization) => {
  if (isPrescriptionDatesPrioritization(prioritization)) {
    // the soonest prescription is the one to look at first
    return "asc";
  }

  if (prioritization === "globalScore") {
    // the riskiest patient is the one to look at first
    return "desc";
  }

  return null;
};

// the point in time the user is looking from, defaulting to the machine clock
// floored to the slider step
export const getDefaultPrescriptionDatesFilter = (now = new Date()) => {
  const datetime = new Date(now);
  datetime.setMinutes(
    Math.floor(datetime.getMinutes() / TIME_SLIDER_STEP) * TIME_SLIDER_STEP,
    0,
    0,
  );

  return { datetime: datetime.toISOString() };
};

// the instant "next prescription" is measured from: the filter pointer while
// it is set, the machine clock otherwise
export const getPrescriptionDatesReference = (config) => {
  const time = config?.datetime ? Date.parse(config.datetime) : NaN;

  return Number.isNaN(time) ? new Date() : new Date(time);
};

// re-derives next prescription/grouped dates of every agg prescription from
// the reference instant, so they follow the filter pointer instead of the
// load-time clock used by the transformer
export const applyPrescriptionDatesReference = (list, config) => {
  const reference = getPrescriptionDatesReference(config);

  return (list || []).map((i) =>
    i.prescriptionDates?.length
      ? { ...i, ...getPrescriptionDatesInfo(i.prescriptionDates, reference) }
      : i,
  );
};

// keeps agg prescriptions having at least one inner prescription date at or
// after the chosen instant. Prescriptions with no inner dates (not processed
// yet, or a non-agg list) are kept — the filter only judges what it can see.
export const filterByPrescriptionDates = (list, config) => {
  const start = config?.datetime ? Date.parse(config.datetime) : NaN;

  if (Number.isNaN(start)) {
    return list;
  }

  return list.filter((i) => {
    const dates = (i.prescriptionDates || [])
      .map((d) => Date.parse(d))
      .filter((time) => !Number.isNaN(time));

    return dates.length === 0 || dates.some((time) => time >= start);
  });
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

  // ties on the date are always broken by global score desc, whatever the
  // direction, so the riskiest patient comes first within the same instant
  const sortDate = (direction) => (a, b) => {
    const compare = Date.parse(a[orderBy]) - Date.parse(b[orderBy]);
    if (compare !== 0) {
      return direction === "desc" ? -compare : compare;
    }

    return b["globalScore"] - a["globalScore"];
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

    return [...withDate.sort(sortDate(orderDirection)), ...withoutDate];
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
