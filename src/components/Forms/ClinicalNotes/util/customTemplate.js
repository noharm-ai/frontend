import { getInterventionList } from "./getInterventionTemplate";
import {
  alertsTemplate,
  getConciliationDrugs,
  signatureTemplate,
} from "./templates";
import { uniq } from "utils/lodash";
import { getIMC, getCorporalSurface } from "utils";
import { formatDate } from "utils/date";
import dayjs from "dayjs";

export const getCustomClinicalNote = (
  prescription,
  clinicalNote,
  params = {},
  t
) => {
  let resultText = clinicalNote;
  const drugs = [
    ...prescription.data.prescriptionRaw,
    ...prescription.data.solutionRaw,
    ...prescription.data.proceduresRaw,
  ];
  const interventions = getInterventionList(prescription, t);

  const alerts = alertsTemplate(prescription);

  const conciliationDrugsWithRelation = getConciliationDrugs(
    prescription.prescription.list.length
      ? prescription.prescription.list[0].value
      : [],
    true,
    prescription.data.conciliaList
  );

  const conciliationDrugsWithoutRelation = getConciliationDrugs(
    prescription.prescription.list.length
      ? prescription.prescription.list[0].value
      : [],
    false,
    prescription.data.conciliaList
  );

  // custom vars
  resultText = alertsByType(resultText, prescription);
  resultText = alertsByLevel(resultText, prescription);
  resultText = drugsByFieldList(resultText, drugs, {
    field: "idSubstance",
    varName: "substancias",
    empty: "Nenhum medicamento encontrado",
  });
  resultText = drugsByFieldList(resultText, drugs, {
    field: "idSubstanceClass",
    varName: "classes",
    empty: "Nenhum medicamento encontrado",
  });

  resultText = examsByType(resultText, prescription);

  return resultText
    .replaceAll("{{data_atual}}", formatDate(dayjs()))
    .replaceAll("{{nome_paciente}}", prescription.data.namePatient)
    .replaceAll(
      "{{dtnascimento_paciente}}",
      formatDate(prescription.data.birthdate)
    )
    .replaceAll("{{data_internacao}}", prescription.data.admissionDate)
    .replaceAll("{{setor}}", prescription.data.department)
    .replaceAll("{{nratendimento_paciente}}", prescription.data.admissionNumber)
    .replaceAll("{{peso_paciente}}", getWeight(prescription.data.weight))
    .replaceAll("{{altura_paciente}}", getHeight(prescription.data.height))
    .replaceAll("{{idade_paciente}}", getAge(prescription.data.age))
    .replaceAll("{{escore_global}}", prescription.data.features?.globalScore)
    .replaceAll("{{sinais_nhcare}}", getSignsNhCare(prescription))
    .replaceAll("{{dados_nhcare}}", getInfoNhCare(prescription))
    .replaceAll(
      "{{risco_paciente}}",
      getPatientRisk(
        prescription.data.agg,
        prescription.data.features?.globalScore
      )
    )
    .replaceAll(
      "{{imc_paciente}}",
      getPatientIMC(prescription.data.weight, prescription.data.height)
    )
    .replaceAll(
      "{{superficie_corporal_paciente}}",
      getPatientCorporalSurface(
        prescription.data.weight,
        prescription.data.height
      )
    )
    .replaceAll("{{exames}}", getExams(prescription.data.exams))
    .replaceAll(
      "{{exames_alterados}}",
      getExamsOutOfReference(prescription.data.exams)
    )
    .replaceAll("{{alergias}}", getAllergies(prescription.data.notesAllergies))
    .replaceAll(
      "{{intervencoes}}",
      interventions || "Nenhuma intervenção registrada"
    )
    .replaceAll("{{alertas}}", alerts || "Nenhum alerta registrado")
    .replaceAll(
      "{{medicamentos_conciliados}}",
      conciliationDrugsWithRelation || "--"
    )
    .replaceAll(
      "{{medicamentos_nao_conciliados}}",
      conciliationDrugsWithoutRelation || "--"
    )
    .replaceAll(
      "{{antimicrobianos}}",
      getAntimicrobial(drugs, {
        empty: "Nenhum Antimicrobiano encontrado.",
      })
    )
    .replaceAll(
      "{{nao_padronizados}}",
      getDrugsByAttribute(drugs, "np", {
        period: false,
        empty: "Nenhum medicamento Não Padronizado encontrado.",
      })
    )
    .replaceAll(
      "{{alta_vigilancia}}",
      getDrugsByAttribute(drugs, "av", {
        empty: "Nenhum medicamento de Alta Vigilância encontrado",
      })
    )
    .replaceAll(
      "{{controlados}}",
      getDrugsByAttribute(drugs, "c", {
        empty: "Nenhum medicamento Controlado encontrado.",
      })
    )
    .replaceAll(
      "{{dialisaveis}}",
      getDialyzable(drugs, prescription.data.dialysis, {
        empty: "Nenhum medicamento Dialisável encontrado.",
      })
    )
    .replaceAll(
      "{{quimioterapico}}",
      getDrugsByInternalAttribute(drugs, "chemo", {
        empty: "Nenhum medicamento Quimioterápico encontrado",
      })
    )
    .replaceAll(
      "{{mpi}}",
      getDrugsByInternalAttribute(drugs, "elderly", {
        empty: "Nenhum medicamento MPI encontrado",
      })
    )
    .replaceAll(
      "{{med_sonda}}",
      getDrugsByInternalAttribute(drugs, "tube", {
        empty: "Nenhum medicamento por sonda encontrado",
      })
    )
    .replaceAll(
      "{{med_risco_queda}}",
      getDrugsByInternalAttribute(drugs, "fallRisk", {
        empty: "Nenhum medicamento com risco de queda encontrado",
      })
    )
    .replaceAll(
      "{{med_risco_gestacao_d}}",
      getDrugs(
        drugs.filter((d) => d?.drugAttributes?.pregnant === "D"),
        {
          empty: "Nenhum medicamento com risco de gestação D encontrado",
        }
      )
    )
    .replaceAll(
      "{{med_risco_gestacao_x}}",
      getDrugs(
        drugs.filter((d) => d?.drugAttributes?.pregnant === "X"),
        {
          empty: "Nenhum medicamento com risco de gestação X encontrado",
        }
      )
    )
    .replaceAll(
      "{{med_risco_lactacao_medio}}",
      getDrugs(
        drugs.filter((d) => d?.drugAttributes?.lactating === "2"),
        {
          empty: "Nenhum medicamento com risco na lactação médio encontrado",
        }
      )
    )
    .replaceAll(
      "{{med_risco_lactacao_alto}}",
      getDrugs(
        drugs.filter((d) => d?.drugAttributes?.lactating === "3"),
        {
          empty: "Nenhum medicamento com risco na lactação alto encontrado",
        }
      )
    )
    .replaceAll(
      "{{antitromboticos}}",
      getDrugsByClass(
        drugs,
        ["B1"],
        "Nenhum medicamento Antitrombótico encontrado."
      )
    )
    .replaceAll(
      "{{profilaxia_ulcera_estresse}}",
      getDrugsByClass(
        drugs,
        ["A02B"],
        "Nenhum medicamento de Profilaxia de Úlcera de Estresse encontrado."
      )
    )
    .replaceAll(
      "{{profilaxia_ocular}}",
      getDrugsByClass(
        drugs,
        ["S1K1", "S1X2"],
        "Nenhum medicamento de Profilaxia Ocular encontrado."
      )
    )
    .replaceAll(
      "{{analgesicos}}",
      getDrugsByClass(
        drugs,
        ["N2"],
        "Nenhum medicamento Analgésico encontrado."
      )
    )
    .replaceAll(
      "{{anestesicos_gerais}}",
      getDrugsByClass(
        drugs,
        ["N1A1", "N1A2"],
        "Nenhum medicamento Anestésico Geral encontrado."
      )
    )
    .replaceAll(
      "{{vasopressores_inotropicos}}",
      getDrugsByClass(
        drugs,
        ["C1C", "C1F", "H4D"],
        "Nenhum medicamento Vasopressor ou Inotrópico encontrado."
      )
    )
    .replaceAll(
      "{{assinatura}}",
      signatureTemplate(params.signature, params.account)
    );
};

const getSignsNhCare = (prescription) => {
  if (prescription.data.notesSigns) {
    return `${prescription.data.notesSigns} (Retirado em: ${formatDate(
      prescription.data.notesSignsDate
    )})`;
  }

  return "Nenhum registro encontrado";
};

const getInfoNhCare = (prescription) => {
  if (prescription.data.notesInfo) {
    return `${prescription.data.notesInfo} (Retirado em: ${formatDate(
      prescription.data.notesInfoDate
    )})`;
  }

  return "Nenhum registro encontrado";
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
        const date = e.value.date ? ` (${formatDate(e.value.date)})` : "";
        return `- ${e.value.initials}: ${e.value.value.toLocaleString()} ${
          e.value.unit
        }${date}`;
      } else {
        return `- ${e.value.initials}: --`;
      }
    });

    return list.join("\n");
  } catch {
    return "Não foi possível encontrar os exames";
  }
};

const getExamsOutOfReference = (exams) => {
  if (!exams) {
    return "Nenhum exame alterado encontrado.";
  }

  const oorExams = exams.filter((e) => {
    return e.value.alert;
  });

  if (oorExams.length === 0) {
    return "Nenhum exame alterado encontrado.";
  }

  try {
    const list = oorExams.map((e) => {
      if (e.value.value) {
        const date = e.value.date ? ` (${formatDate(e.value.date)})` : "";
        return `- ${e.value.initials}: ${e.value.value.toLocaleString()} ${
          e.value.unit
        }${date}`;
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

  const list = uniq(
    allergies.map(({ text }) => {
      return `- ${text}`;
    })
  ).sort();

  return list.join("\n");
};

const getDrugsByAttribute = (drugs, attr, params = {}) => {
  if (!drugs || (drugs && !drugs.length)) {
    return params.empty;
  }

  const list = uniq(
    drugs.filter((d) => d[attr]).map((d) => drugTemplate(d, params))
  ).sort();

  if (!list.length) {
    return params.empty;
  }

  return list.join("\n");
};

const getDrugsByInternalAttribute = (drugs, attr, params = {}) => {
  if (!drugs || (drugs && !drugs.length)) {
    return params.empty;
  }

  const list = uniq(
    drugs
      .filter((d) => d?.drugAttributes && d.drugAttributes[attr])
      .map((d) => drugTemplate(d, params))
  ).sort();

  if (!list.length) {
    return params.empty;
  }

  return list.join("\n");
};

const getDrugs = (drugs, params = {}) => {
  if (!drugs || (drugs && !drugs.length)) {
    return params.empty;
  }

  const list = uniq(drugs.map((d) => drugTemplate(d, params))).sort();

  if (!list.length) {
    return params.empty;
  }

  return list.join("\n");
};

const getDialyzable = (drugs, dialysis, params = {}) => {
  if (!drugs || (drugs && !drugs.length)) {
    return params.empty;
  }

  if (dialysis === "0" || dialysis == null) {
    return "Não há informação sobre diálise para este paciente";
  }

  const list = uniq(
    drugs.filter((d) => d.dialyzable).map((d) => drugTemplate(d, params))
  ).sort();

  if (!list.length) {
    return params.empty;
  }

  return list.join("\n");
};

const getDrugsByClass = (drugs, classList, empty) => {
  if (!drugs || (drugs && !drugs.length)) {
    return empty;
  }

  const list = uniq(
    drugs
      .filter((d) => {
        let hasClass = false;

        classList.forEach((c) => {
          if (`${d.idSubstanceClass}`.startsWith(c)) {
            hasClass = true;
          }
        });

        return hasClass;
      })
      .map((d) => drugTemplate(d, {}))
  ).sort();

  if (!list.length) {
    return empty;
  }

  return list.join("\n");
};

const getPatientIMC = (weight, height) => {
  if (weight && height) {
    return `${getIMC(weight, height).toFixed(2)} kg/m²`;
  }

  return "Não informado";
};

const getPatientCorporalSurface = (weight, height) => {
  if (weight && height) {
    return `${getCorporalSurface(weight, height).toFixed(3)} m²`;
  }

  return "Não informado";
};

const getPatientRisk = (agg, globalScore) => {
  if (!agg) {
    return "Não definido para prescrições individuais";
  }

  if (globalScore > 90) {
    return "Crítico";
  }

  if (globalScore > 60) {
    return "Alto";
  }

  if (globalScore > 10) {
    return "Médio";
  }

  if (globalScore > 0) {
    return "Baixo";
  }

  return "-";
};

const alertsByType = (clinicalNote, prescription) => {
  let resultText = clinicalNote;
  const variables = clinicalNote.match(/\{\{(alerta_tipo.*?)\}\}/g);

  if (!variables) {
    return resultText;
  }

  variables.forEach((item) => {
    const type = item.replace("{{", "").replace("}}", "").split(".")[1];

    resultText = resultText.replace(item, alertsTemplate(prescription, type));
  });

  return resultText;
};

const alertsByLevel = (clinicalNote, prescription) => {
  let resultText = clinicalNote;
  const variables = clinicalNote.match(/\{\{(alerta_nivel.*?)\}\}/g);

  if (!variables) {
    return resultText;
  }

  variables.forEach((item) => {
    const level = item.replace("{{", "").replace("}}", "").split(".")[1];

    resultText = resultText.replace(
      item,
      alertsTemplate(prescription, null, level)
    );
  });

  return resultText;
};

const examsByType = (clinicalNote, prescription) => {
  let resultText = clinicalNote;
  const variables = clinicalNote.match(/\{\{(exame_unico.*?)\}\}/g);

  if (!variables) {
    return resultText;
  }

  variables.forEach((item) => {
    const examType = item.replace("{{", "").replace("}}", "").split(".")[1];

    const examsList = prescription.data.exams.filter((e) => e.key === examType);

    resultText = resultText.replace(item, getExams(examsList));
  });

  return resultText;
};

const drugsByFieldList = (clinicalNote, drugs, params = {}) => {
  let resultText = clinicalNote;
  const variables = clinicalNote.match(
    new RegExp("{{(" + params.varName + ".*?)}}", "g")
  );

  if (!variables) {
    return resultText;
  }

  if (!drugs || (drugs && !drugs.length)) {
    return params.empty;
  }

  variables.forEach((item) => {
    const varName = item.replace("{{", "").replace("}}", "").split(".")[1];

    const fieldList = varName.split("_");

    const list = uniq(
      drugs
        .filter((d) => fieldList.indexOf(`${d[params.field]}`) !== -1)
        .map((d) => drugTemplate(d, params))
    ).sort();

    if (!list.length) {
      resultText = resultText.replace(item, params.empty);
    } else {
      resultText = resultText.replace(item, list.join("\n"));
    }
  });

  return resultText;
};

const drugTemplate = (d, params) => {
  const dose = `(${
    d.dose !== null
      ? `${d.dose} ${d.measureUnit ? d.measureUnit.label : ""}`
      : "Dose não informada"
  }  X ${d.frequency?.label ? d.frequency.label : "Frequência não informada"})`;

  if (params.period) {
    return `- ${d.drug} (Período: ${d.totalPeriod || 0}D) ${dose}`;
  }

  return `- ${d.drug} ${dose}`;
};

const getAntimicrobial = (
  drugs,
  params = { empty: "Nenhum antimicrobiano encontrado" }
) => {
  if (!drugs || (drugs && !drugs.length)) {
    return params.empty;
  }

  const atmList = drugs
    .filter((d) => d.am)
    .map((d) => ({
      drug: d.drug,
      dose:
        d.dose !== null
          ? `${d.dose} ${d.measureUnit ? d.measureUnit.label : ""}`
          : "Dose não informada",
      frequency: `${
        d.frequency?.label ? d.frequency.label : "Frequência não informada"
      })`,
      period: d.totalPeriod,
    }));

  if (!atmList.length) {
    return params.empty;
  }

  const groupedAtmList = Object.values(
    atmList.reduce((acc, item) => {
      const key = `${item.drug}`;

      if (!acc[key] || item.period > acc[key].period) {
        acc[key] = item;
      }

      return acc;
    }, {})
  );

  return groupedAtmList
    .map(
      (i) => `${i.drug} (Período: ${i.period}D) (${i.dose} X ${i.frequency})`
    )
    .join("\n");
};
