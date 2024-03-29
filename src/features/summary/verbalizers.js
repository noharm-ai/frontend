import moment from "moment";

export const examsToText = (exams) => {
  if (!exams || !exams.length) {
    return "Nenhum exame encontrado";
  }

  const examList = exams.map(
    (e) =>
      `* ${e.name} (${e.date ? moment(e.date).format("DD/MM/YYYY") : "-"}): ${
        e.result
      } ${e.measureUnit || ""}`
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

export const drugsUsedTotext = (list) => {
  if (!list || !list.length) {
    return "Nenhum registro encontrado";
  }

  const periodKeys = ["J1"];

  const groups = [];
  list.forEach((item) => {
    const idClass = item.idClass || "empty";

    if (!groups[idClass]) {
      groups[idClass] = [item];
    } else {
      groups[idClass].push(item);
    }
  });

  const result = [];
  Object.keys(groups).forEach((g) => {
    const drugs = [];
    groups[g].forEach((d) => {
      let drug = d.name;

      if (periodKeys.indexOf(g) !== -1) {
        drug = `\n- ${d.name} -- ${d.period}`;
      }

      drugs.push(drug);
    });
    result.push(`* ${groups[g][0].nameClass || "Outros"}: ${drugs.join(", ")}`);
  });

  return result.join("\n");
};

export const receiptToText = (list) => {
  if (!list || !list.length) {
    return "Nenhum medicamento encontrado";
  }

  const groups = [];
  list.forEach((item) => {
    const idClass = item.route || "empty";

    if (!groups[idClass]) {
      groups[idClass] = [item];
    } else {
      groups[idClass].push(item);
    }
  });

  const result = [];
  Object.keys(groups).forEach((g) => {
    const drugs = [];
    groups[g].forEach((d) => {
      drugs.push(`* ${d.name}: ${d.dose} ${d.measureUnit} ${d.frequency}`);
    });
    result.push(
      `\nVia ${groups[g][0].route || "Nada consta"}: \n${drugs.join("\n")}`
    );
  });

  return result.join("\n").trim();
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
  return `Peso: ${patient.weight ? `${patient.weight} Kg ` : "Não informado"}
Data do Peso: ${
    patient.weightDate
      ? moment(patient.weightDate).format("DD/MM/YYYY")
      : "Não informado"
  }
Altura: ${patient.height ? `${patient.height} cm` : "Não informado"}  
IMC: ${patient.imc ? `${patient.imc} kg/m²` : "Não informado"}  
`;
};

// todo: add config
export const blocksToText = (summaryBlocks) => {
  return `1) Identificação do Paciente

${summaryBlocks["patient"]?.text || "Nada consta"}

2) Dados da Internação

${summaryBlocks["admission"]?.text || "Nada consta"}

2.1) Admissão

2.1.1) Motivo

${summaryBlocks["reason"]?.text || "Nada consta"}

2.1.2) Diagnósticos (primário e secundário)

${summaryBlocks["diagnosis"]?.text || "Nada consta"}

2.1.3) Alergias

${summaryBlocks["allergies"]?.text || "Nada consta"}

2.1.4) Medicamentos de uso prévio

${summaryBlocks["previousDrugs"]?.text || "Nada consta"}

2.2) Resumo Clínico

${summaryBlocks["clinicalSummary"]?.text || "Nada consta"}

2.2.1) Exames Laboratoriais

${summaryBlocks["labExams"]?.text || "Nada consta"}

2.2.2) Exames Textuais

${summaryBlocks["textExams"]?.text || "Nada consta"}

2.2.3) Procedimentos realizados

${summaryBlocks["procedures"]?.text || "Nada consta"}

2.2.4) Medicamentos utilizados na internação

${summaryBlocks["drugsUsed"]?.text || "Nada consta"}

2.2.5) Medicamentos Contínuos Interrompidos Durante a Internação

${summaryBlocks["drugsSuspended"]?.text || "Nada consta"}

2.3) Condição de Alta

${summaryBlocks["dischargeCondition"]?.text || "Nada consta"}
${summaryBlocks["dischargeStats"]?.text || "Nada consta"}

3) PLANO TERAPÊUTICO

3.1) Plano de Alta

${summaryBlocks["dischargePlan"]?.text || "Nada consta"}

3.2) Receita

${summaryBlocks["recipe"]?.text || "Nada consta"}
`;
};
