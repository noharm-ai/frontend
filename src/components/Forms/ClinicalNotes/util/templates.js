import isEmpty from "lodash.isempty";

import stripHtml from "utils/stripHtml";

const emptyInterventionMessage = `
  Nenhuma intervenção registrada.
`;

const getConduct = (interventions, conciliationType) => {
  if (interventions !== "") {
    if (conciliationType === "t") {
      return `
Realizada a conciliação dos medicamentos em uso no setor anterior e feitas intervenções pertinentes. Caso as divergências encontradas sejam intencionais, desconsiderar.
`;
    }

    return `
Realizada a conciliação dos medicamentos de uso domiciliar e feitas intervenções pertinentes. Caso as divergências encontradas sejam intencionais, desconsiderar.
`;
  }

  return `
Realizada a conciliação dos medicamentos e não encontrada divergência não intencional.
`;
};

const getConciliationHeader = (prescription) => `Farmácia Clínica
${prescription.data.namePatient}, ${prescription.data.age}${
  prescription.data.weight ? `, ${prescription.data.weight}Kg` : ""
}`;

const drugDescription = (d) => {
  return `${d.drug}: ${d.dose ? d.dosage : ""} ${
    d.frequency ? d.frequency.label : ""
  }`;
};

export const getConciliationDrugs = (list, hasRelation) => {
  let drugList;
  if (hasRelation) {
    drugList = list.filter((d) => !d.suspended && d.conciliaRelationId);
  } else {
    drugList = list.filter((d) => !d.suspended && !d.conciliaRelationId);
  }

  return drugList
    .map(
      (d) => `
- ${drugDescription(d)}
  `
    )
    .filter((t) => t != null)
    .join("");
};

const getConciliationDrugList = (list, group, conciliationType) => {
  const drugList = list.filter((d) => !d.suspended);

  if (
    drugList.length === 0 ||
    (drugList.length === 1 && drugList[0].drug === "")
  ) {
    return `
Paciente nega uso contínuo de medicamentos.
`;
  }

  if (!group) {
    const drugs = drugList.map(
      (d) => `
  - ${drugDescription(d)}
  `
    );

    return drugs.join("");
  }

  const tplWithRelation = drugList
    .map((d) => {
      if (d.conciliaRelationId) {
        return `
  - ${drugDescription(d)}
    `;
      }

      return null;
    })
    .filter((t) => t != null);

  const tplWithoutRelation = drugList
    .map((d) => {
      if (d.conciliaRelationId == null) {
        return `
  - ${drugDescription(d)}
    `;
      }

      return null;
    })
    .filter((t) => t != null);

  let tpl = "";

  if (tplWithRelation.length) {
    tpl += `
*${
      conciliationType === "t"
        ? "Medicamentos com vínculo na prescrição vigente"
        : "Medicamento ou indicação cobertos em prescrição hospitalar"
    }:
    ${tplWithRelation.join("")}
    `;
  }

  if (tplWithoutRelation.length) {
    tpl += `
*${
      conciliationType === "t"
        ? "Medicamentos sem vínculo na prescrição vigente"
        : "Medicamento ou indicação NÃO cobertos em prescrição hospitalar"
    }:
    ${tplWithoutRelation.join("")}
    `;
  }

  return tpl;
};

const conciliationNotPerformedTemplate = (
  prescription,
  signature
) => `${getConciliationHeader(prescription)}

Conciliação medicamentosa por farmacêutico não realizada neste internamento; paciente não localizado no momento da visita ao leito ou entrevista realizada anteriormente por outro profissional de saúde.

${signature}
`;

const conciliationDischargeTemplate = (
  prescription,
  signature
) => `${getConciliationHeader(prescription)}

Realizadas orientações farmacêuticas ao paciente e acompanhante a respeito dos medicamentos prescritos para uso domiciliar:
${getConciliationDrugList(
  prescription.prescription.list.length
    ? prescription.prescription.list[0].value
    : [],
  false
)}
Orientações:

Oriento quanto a indicação terapêutica e posologia dos medicamentos prescritos para uso domiciliar. 
Oriento quanto a importância em seguir as posologias recomendadas e da adesão aos tratamentos propostos.
Oriento a retirada dos medicamentos na farmácia ambulatorial e na UBS.
Entrego receitas médicas.

Esclareço demais dúvidas apresentadas no momento. 

${signature}
`;

const conciliationDefaultBodyTemplate = (
  prescription,
  interventions,
  signature,
  conciliationType
) => `2. Conciliação medicamentosa:
${getConciliationDrugList(
  prescription.prescription.list.length
    ? prescription.prescription.list[0].value
    : [],
  true,
  conciliationType
)}
3. Intervenções:
${interventions === "" ? emptyInterventionMessage : interventions}
4. Conduta:
${getConduct(interventions, conciliationType)}

Me coloco à disposição.

${signature}`;

const conciliationTransferenceTemplate = (
  prescription,
  interventions,
  signature,
  conciliationType
) => `${getConciliationHeader(prescription)}

1. Transferência interna:

  De:
  Para:

${conciliationDefaultBodyTemplate(
  prescription,
  interventions,
  signature,
  conciliationType
)}
`;

const conciliationAdmissionTemplate = (
  prescription,
  interventions,
  signature,
  conciliationType
) => `${getConciliationHeader(prescription)}

Conciliação Medicamentosa realizada com:

1. Histórico de saúde:


${conciliationDefaultBodyTemplate(
  prescription,
  interventions,
  signature,
  conciliationType
)}
`;

export const conciliationTemplate = (
  prescription,
  interventions,
  signature,
  conciliationType
) => {
  switch (conciliationType) {
    case "n":
      return conciliationNotPerformedTemplate(prescription, signature);

    case "a":
      return conciliationDischargeTemplate(prescription, signature);

    case "t":
      return conciliationTransferenceTemplate(
        prescription,
        interventions,
        signature,
        conciliationType
      );

    default:
      return conciliationAdmissionTemplate(
        prescription,
        interventions,
        signature,
        conciliationType
      );
  }
};

export const prescriptionTemplate = (p, i, id) => {
  if (id !== "0") {
    return `
Prescrição nº ${p}

${i}
`;
  }

  return `
${i}
  `;
};

export const interventionTemplate = (i) => `
  ${i.drugName}
  ${i.observation ? stripHtml(i.observation) : ""}
`;

export const interventionCompleteTemplate = (i, t) => `
  -- ${i.drugName}
  (${
    i.dose !== null
      ? `${i.dose} ${i.measureUnit ? i.measureUnit.label : ""}`
      : "Dose não informada"
  }  X ${i.frequency ? i.frequency.label : "Frequência não informada"})
  Intervenção: ${
    i.observation ? stripHtml(i.observation) : "Nenhuma observação registrada"
  }
  Desfecho: ${t("interventionStatus." + i.status)}
`;

const emptyInterventionTemplate = ({ idPrescription, agg, concilia }) => {
  if (concilia) {
    return conciliationTemplate(
      "",
      `
      Nenhuma divergência encontrada.
      `
    );
  }

  const msg = `S/O: Verifico prescrição vigente do paciente.

  A: Realizo validação de dose, via e frequência dos medicamentos prescritos.
  
  P: Acompanhamento da conduta médica na próxima prescrição.
  
  Validação diária das prescrições do paciente.
  Me coloco à disposição.`;

  if (agg) {
    return `  ${msg}`;
  }

  return `Prescrição: ${idPrescription}

  ${msg}
  `;
};

export const layoutTemplate = (
  prescription,
  interventions,
  signature
) => `Farmácia Clínica
${prescription.namePatient}, ${prescription.age}${
  prescription.weight ? `, ${prescription.weight}Kg` : ""
}

${interventions || emptyInterventionTemplate(prescription)}

${signature}
`;

export const signatureTemplate = (signature, account) => {
  if (isEmpty(signature.list) || signature.list[0].value === "") {
    return `Farm. ${account.userName}
CRF/UF:
Ramal:`;
  }

  return signature.list[0].value;
};

export const alertsTemplate = (prescription) => {
  const list = [
    ...prescription.data.prescriptionRaw,
    ...prescription.data.solutionRaw,
    ...prescription.data.proceduresRaw,
  ];

  let alerts = [];
  list.forEach((i) => {
    if (i.alertsComplete && i.alertsComplete.length) {
      const tpl = `
        Medicamento: ${i.drug}
        Alertas:
        -- ${i.alertsComplete.map((a) => a.text).join("\r\n        -- ")}
      `;
      alerts = [...alerts, tpl];
    }
  });

  return alerts.map((a) => `${stripHtml(a)}`).join("");
};
