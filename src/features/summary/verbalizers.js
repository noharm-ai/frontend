import moment from "moment";

export const examsToText = (exams) => {
  if (!exams || !exams.length) {
    return "Nenhum exame encontrado";
  }

  const examList = exams.map(
    (e) =>
      `* ${e.name} (${e.date ? moment(e.date).format("DD/MM/YYYY") : "-"}): ${
        e.result
      } ${e.measureUnit}`
  );

  return examList.join("\n");
};

export const allergiesToText = (allergies) => {
  if (!allergies || !allergies.length) {
    return "Nenhuma alergia encontrada";
  }

  // TODO
  const list = allergies.map((e) => `* ${e.name}`);

  return list.join("\n");
};

export const listToText = (list, prop) => {
  if (!list || !list.length) {
    return "Nenhum registro encontrado";
  }

  return list.map((e) => `* ${e[prop]}`).join("\n");
};

export const receiptToText = (drugs) => {
  if (!drugs || !drugs.length) {
    return "Nenhum medicamento encontrado";
  }

  const list = drugs.map(
    (e) =>
      `* ${e.name}: ${e.dose} ${e.measureUnit} ${e.frequency} (Via ${e.route})`
  );

  return list.join("\n");
};
