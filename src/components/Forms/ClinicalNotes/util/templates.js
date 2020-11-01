import stripHtml from '@utils/stripHtml';

const emptyInterventionTemplate = `S/O: Verifico prescrição vigente do paciente.

A: Realizo validação de dose, via e frequência dos medicamentos prescritos.

P: Acompanhamento da conduta médica na próxima prescrição.

Validação diária das prescrições do paciente.
Me coloco à disposição.`;

export const prescriptionTemplate = (p, i) => `
Prescrição nº ${p}

    ${i}
`;

export const interventionTemplate = i => `
${i.drugName}
${stripHtml(i.observation)}
`;

export const layoutTemplate = (prescription, interventions, signature) => `Farmácia Clínica
${prescription.namePatient}, ${prescription.age}${
  prescription.weight ? `, ${prescription.weight}Kg` : ''
}

${interventions || emptyInterventionTemplate}

${signature}
`;

export const signatureTemplate = account => `Farm. ${account.userName}
CRF/UF:
Ramal:`;
