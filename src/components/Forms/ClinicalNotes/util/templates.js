import isEmpty from 'lodash.isempty';

import stripHtml from '@utils/stripHtml';

const emptyInterventionMessage = `
  Nenhuma intervenção registrada.
`;

const getConduct = interventions => {
  if (interventions !== '') {
    return `
Realizada a conciliação dos medicamentos de uso domiciliar e feitas intervenções pertinentes. Caso as divergências encontradas sejam intencionais, desconsiderar.
`;
  }
  return `
Realizada a conciliação dos medicamentos e não encontrada divergência não intencional.
`;
};

const getConciliationDrugList = list => {
  const tplWithRelation = list
    .map(d => {
      if (d.conciliaRelationId) {
        return `
  - ${d.drug}: ${d.dosage} ${d.frequency ? d.frequency.label : ''}
    `;
      }

      return null;
    })
    .filter(t => t != null);

  const tplWithoutRelation = list
    .map(d => {
      if (d.conciliaRelationId == null) {
        return `
  - ${d.drug}: ${d.dosage} ${d.frequency ? d.frequency.label : ''}
    `;
      }

      return null;
    })
    .filter(t => t != null);

  let tpl = '';

  if (tplWithRelation.length) {
    tpl += `
*Medicamento ou indicação cobertos em prescrição hospitalar:
    ${tplWithRelation.join('')}
    `;
  }

  if (tplWithoutRelation.length) {
    tpl += `
*Medicamento ou indicação NÃO cobertos em prescrição hospitalar:
    ${tplWithoutRelation.join('')}
    `;
  }

  return tpl;
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
