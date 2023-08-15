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

export const patientToText = (patient) => {
  return `Paciente: ${patient.name}
Data de Nascimento: ${
    patient.birthdate
      ? `${moment(patient.birthdate).format("DD/MM/YYYY")}`
      : "Não informado"
  }
Atendimento: ${patient.admissionNumber}
Sexo: ${
    patient.gender === "M"
      ? "Masculino"
      : patient.gender === "F"
      ? "Feminino"
      : "Não informado"
  }
Cor: ${patient.color || "Não informado"}
  `;
};

export const admissionAttrToText = (patient) => {
  return `Data da internação: ${
    patient.admissionDate
      ? `${moment(patient.admissionDate).format("DD/MM/YYYY")}`
      : "Não informado"
  }
Data da alta: ${
    patient.dischargeDate
      ? `${moment(patient.dischargeDate).format("DD/MM/YYYY")}`
      : "Não informado"
  }`;
};

export const patientAttrToText = (patient) => {
  return `Peso: ${patient.weight ? `${patient.weight} Kg` : "Não informado"}
Altura: ${patient.height ? `${patient.height} cm` : "Não informado"}  
IMC: ${patient.imc ? `${patient.imc} kg/m²` : "Não informado"}  
`;
};

// todo: add config
export const blocksToText = (summaryBlocks) => {
  return `1) Identificação do Paciente

${summaryBlocks[0] || ""}

2) Dados da Internação

${summaryBlocks[1] || ""}

2.1) Admissão

2.1.1) Motivo

${summaryBlocks[2] || ""}

2.1.2) Diagnósticos (primário e secundário)

${summaryBlocks[3] || ""}

2.1.3) Alergias

${summaryBlocks[4] || ""}

2.1.4) Medicamentos de uso prévio

${summaryBlocks[5] || ""}

2.2) Resumo Clínico

${summaryBlocks[6] || ""}

2.2.1) Exames complementares

${summaryBlocks[7] || ""}
${summaryBlocks[8] || ""}

2.2.2) Procedimentos realizados

${summaryBlocks[9] || ""}

2.2.3) Medicamentos utilizados na internação

${summaryBlocks[10] || ""}

2.2.4) Medicamentos interrompidos

${summaryBlocks[11] || ""}

2.3) Condição de Alta

${summaryBlocks[12] || ""}
${summaryBlocks[13] || ""}

3) PLANO TERAPÊUTICO

3.1) Receita

${summaryBlocks[14] || ""}

3.2) Plano de Alta

${summaryBlocks[15] || ""}
`;
};
