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
    .replace("{{data_atual}}", formatDate(dayjs()))
    .replace("{{nome_paciente}}", prescription.data.namePatient)
    .replace("{{peso_paciente}}", getWeight(prescription.data.weight))
    .replace("{{altura_paciente}}", getHeight(prescription.data.height))
    .replace("{{idade_paciente}}", getAge(prescription.data.age))
    .replace("{{escore_global}}", prescription.data.features?.globalScore)
    .replace(
      "{{risco_paciente}}",
      getPatientRisk(
        prescription.data.agg,
        prescription.data.features?.globalScore
      )
    )
    .replace(
      "{{imc_paciente}}",
      getPatientIMC(prescription.data.weight, prescription.data.height)
    )
    .replace(
      "{{superficie_corporal_paciente}}",
      getPatientCorporalSurface(
        prescription.data.weight,
        prescription.data.height
      )
    )
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
      "{{antimicrobianos}}",
      getDrugsByAttribute(drugs, "am", {
        period: true,
        empty: "Nenhum Antimicrobiano encontrado.",
      })
    )
    .replace(
      "{{nao_padronizados}}",
      getDrugsByAttribute(drugs, "np", {
        period: false,
        empty: "Nenhum medicamento Não Padronizado encontrado.",
      })
    )
    .replace(
      "{{alta_vigilancia}}",
      getDrugsByAttribute(drugs, "av", {
        empty: "Nenhum medicamento de Alta Vigilância encontrado",
      })
    )
    .replace(
      "{{controlados}}",
      getDrugsByAttribute(drugs, "c", {
        empty: "Nenhum medicamento Controlado encontrado.",
      })
    )
    .replace(
      "{{dialisaveis}}",
      getDialyzable(drugs, prescription.data.dialysis, {
        empty: "Nenhum medicamento Dialisável encontrado.",
      })
    )
    .replace(
      "{{antitromboticos}}",
      getDrugsByClass(
        drugs,
        ["B1"],
        "Nenhum medicamento Antitrombótico encontrado."
      )
    )
    .replace(
      "{{profilaxia_ulcera_estresse}}",
      getDrugsByClass(
        drugs,
        ["A02B"],
        "Nenhum medicamento de Profilaxia de Úlcera de Estresse encontrado."
      )
    )
    .replace(
      "{{profilaxia_ocular}}",
      getDrugsByClass(
        drugs,
        ["S1K1", "S1X2"],
        "Nenhum medicamento de Profilaxia Ocular encontrado."
      )
    )
    .replace(
      "{{analgesicos}}",
      getDrugsByClass(
        drugs,
        ["N2"],
        "Nenhum medicamento Analgésico encontrado."
      )
    )
    .replace(
      "{{anestesicos_gerais}}",
      getDrugsByClass(
        drugs,
        ["N1A1", "N1A2"],
        "Nenhum medicamento Anestésico Geral encontrado."
      )
    )
    .replace(
      "{{vasopressores_inotropicos}}",
      getDrugsByClass(
        drugs,
        ["C1C", "C1F", "H4D"],
        "Nenhum medicamento Vasopressor ou Inotrópico encontrado."
      )
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
  if (!drugs || (drugs && !drugs.length)) {
    return params.empty;
  }

  let resultText = clinicalNote;
  const variables = clinicalNote.match(
    new RegExp("{{(" + params.varName + ".*?)}}", "g")
  );

  if (!variables) {
    return resultText;
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
    return `- ${d.drug} (Período: ${
      d.totalPeriod || 0
    }D **Revisar período) ${dose}`;
  }

  return `- ${d.drug} ${dose}`;
};
