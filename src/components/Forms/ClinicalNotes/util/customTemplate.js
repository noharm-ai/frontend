import { getInterventionList } from "./getInterventionTemplate";
import {
  alertsTemplate,
  getConciliationDrugs,
  signatureTemplate,
} from "./templates";

export const getCustomClinicalNote = (
  prescription,
  clinicalNote,
  params = {}
) => {
  const interventions = getInterventionList(prescription);

  const alerts = alertsTemplate(prescription);

  const conciliationDrugsWithRelation = getConciliationDrugs(
    prescription.prescription.list.length
      ? prescription.prescription.list[0].value
      : [],
    true
  );

  const conciliationDrugsWithoutRelation = getConciliationDrugs(
    prescription.prescription.list.length
      ? prescription.prescription.list[0].value
      : [],
    false
  );

  return clinicalNote
    .replace("{{nome_paciente}}", prescription.data.namePatient)
    .replace("{{peso_paciente}}", getWeight(prescription.data.weight))
    .replace("{{altura_paciente}}", getHeight(prescription.data.height))
    .replace("{{idade_paciente}}", getAge(prescription.data.age))
    .replace("{{exames}}", getExams(prescription.data.exams))
    .replace("{{alergias}}", getAllergies(prescription.data.notesAllergies))
    .replace(
      "{{intervencoes}}",
      interventions || "Nenhuma intervenção registrada"
    )
    .replace("{{alertas}}", alerts || "Nenhum alerta registrado")
    .replace(
      "{{medicamentos_conciliados}}",
      conciliationDrugsWithRelation || "--"
    )
    .replace(
      "{{medicamentos_nao_conciliados}}",
      conciliationDrugsWithoutRelation || "--"
    )
    .replace(
      "{{assinatura}}",
      signatureTemplate(params.signature, params.account)
    );
};

const getWeight = (weight) => {
  if (!weight) {
    return "Não informado";
  }

  return `${weight} Kg`;
};

const getHeight = (height) => {
  if (!height) {
    return "Não informado";
  }

  return `${height} cm`;
};

const getAge = (age) => {
  if (!age) {
    return "Não informado";
  }

  return `${age}`;
};

const getExams = (exams) => {
  if (!exams) {
    return "Nenhum exame encontrado.";
  }

  try {
    const list = exams.map((e) => {
      if (e.value.value) {
        return `- ${e.value.initials}: ${e.value.value.toLocaleString()} ${
          e.value.unit
        }`;
      } else {
        return `- ${e.value.initials}: --`;
      }
    });

    return list.join("\n");
  } catch {
    return "Não foi possível encontrar os exames";
  }
};

const getAllergies = (allergies) => {
  if (!allergies || (allergies && !allergies.length)) {
    return "Nenhum registro de alergia encontrado";
  }

  const list = allergies.map(({ text }) => {
    return `- ${text}`;
  });

  return list.join("\n");
};
