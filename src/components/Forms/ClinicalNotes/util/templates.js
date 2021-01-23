import isEmpty from 'lodash.isempty';

import stripHtml from '@utils/stripHtml';

const emptyInterventionTemplate = prescription => {
  const msg = `S/O: Verifico prescrição vigente do paciente.

  A: Realizo validação de dose, via e frequência dos medicamentos prescritos.
  
  P: Acompanhamento da conduta médica na próxima prescrição.
  
  Validação diária das prescrições do paciente.
  Me coloco à disposição.`;

  if (prescription.agg) {
    return `  ${msg}`;
  }

  return `Prescrição: ${prescription.idPrescription}

  ${msg}
  `;
};

export const prescriptionTemplate = (p, i) => {
  if (p !== '0') {
    return `
Prescrição nº ${p}

${i}
`;
  }

  return `
${i}
  `;
};

export const interventionTemplate = i => `
${i.drugName}
${stripHtml(i.observation)}
`;

export const layoutTemplate = (prescription, interventions, signature) => `Farmácia Clínica
${prescription.namePatient}, ${prescription.age}${
  prescription.weight ? `, ${prescription.weight}Kg` : ''
}

${interventions || emptyInterventionTemplate(prescription)}

${signature}
`;

export const signatureTemplate = (signature, account) => {
  if (isEmpty(signature.list) || signature.list[0].value === '') {
    return `Farm. ${account.userName}
CRF/UF:
Ramal:`;
  }

  return signature.list[0].value;
};
