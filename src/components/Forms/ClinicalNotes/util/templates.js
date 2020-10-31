import stripHtml from '@utils/stripHtml';

export const prescriptionTemplate = (p, i) => `
Prescrição nº ${p}

    ${i}
`;

export const interventionTemplate = i => `
${i.drugName}
${stripHtml(i.observation)}
`;

export const layoutTemplate = (prescription, interventions, signature) => `Farmácia Clínica
${prescription.namePatient}, ${prescription.age}, ${prescription.weight}Kg

${interventions}

${signature}
`;

export const signatureTemplate = account => `Farm. ${account.userName}
CRF/UF:
Ramal:`;
