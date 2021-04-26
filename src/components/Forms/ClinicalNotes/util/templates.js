import isEmpty from 'lodash.isempty';

import stripHtml from '@utils/stripHtml';

const emptyInterventionMessage = `
  Nenhuma intervenção registrada.
`;

const getConduct = interventions => {
  if (interventions !== '') {
    return `
Intervenções realizadas. Contato prescritor e aguardo conduta.
Realizada análise de risco para tromboembolismo venoso. Prescrição de acordo com o protocolo. Contato prescritor para avaliação de terapia farmacológica anticoagulante.
`;
  }
  return `
Realizada análise de risco para tromboembolismo venoso. Prescrição de acordo com o protocolo. Contato prescritor para avaliação de terapia farmacológica anticoagulante.
`;
};

const getConciliationDrugList = list => {
  const tpl = list.map(d => {
    return `
  ${d.drug}: ${d.dosage} ${d.frequency ? d.frequency.label : ''}
  Medicamento ou indicação cobertos em prescrição hospitalar?
    `;
  });

  return tpl.join('');
};

export const conciliationTemplate = (prescription, interventions, signature) => {
  return `Farmácia Clínica
${prescription.data.namePatient}, ${prescription.data.age}${
    prescription.data.weight ? `, ${prescription.data.weight}Kg` : ''
  }

Conciliação Medicamentosa realizada com:

1. Histórico de saúde:


2. Conciliação medicamentosa:
${getConciliationDrugList(prescription.prescription.list[0].value)}
3. Intervenções:
${interventions === '' ? emptyInterventionMessage : interventions}
4. Conduta:
${getConduct(interventions)}

Me coloco à disposição.

${signature}
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

const emptyInterventionTemplate = ({ idPrescription, agg, concilia }) => {
  if (concilia) {
    return conciliationTemplate(
      '',
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
