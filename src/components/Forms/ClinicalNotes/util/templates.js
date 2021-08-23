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

const drugDescription = d => {
  return `${d.drug}: ${d.dose ? d.dosage : ''} ${d.frequency ? d.frequency.label : ''}`;
};

const getConciliationDrugList = (list, group) => {
  const drugList = list.filter(d => !d.suspended);

  if (drugList.length === 0 || (drugList.length === 1 && drugList[0].drug === '')) {
    return `
Paciente nega uso contínuo de medicamentos.
`;
  }

  if (!group) {
    const drugs = drugList.map(
      d => `
  - ${drugDescription(d)}
  `
    );

    return drugs.join('');
  }

  const tplWithRelation = drugList
    .map(d => {
      if (d.conciliaRelationId) {
        return `
  - ${drugDescription(d)}
    `;
      }

      return null;
    })
    .filter(t => t != null);

  const tplWithoutRelation = drugList
    .map(d => {
      if (d.conciliaRelationId == null) {
        return `
  - ${drugDescription(d)}
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

const conciliationNotPerformedTemplate = (prescription, signature) => `Farmácia Clínica
${prescription.data.namePatient}, ${prescription.data.age}${
  prescription.data.weight ? `, ${prescription.data.weight}Kg` : ''
}

Conciliação medicamentosa por farmacêutico não realizada neste internamento; paciente não localizado no momento da visita ao leito ou entrevista realizada anteriormente por outro profissional de saúde.

${signature}
`;

const conciliationDischargeTemplate = (prescription, signature) => `Farmácia Clínica
${prescription.data.namePatient}, ${prescription.data.age}${
  prescription.data.weight ? `, ${prescription.data.weight}Kg` : ''
}

Realizadas orientações farmacêuticas ao paciente e acompanhante a respeito dos medicamentos prescritos para uso domiciliar:
${getConciliationDrugList(
  prescription.prescription.list.length ? prescription.prescription.list[0].value : [],
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

export const conciliationTemplate = (prescription, interventions, signature, conciliationType) => {
  if (conciliationType === 'n') {
    return conciliationNotPerformedTemplate(prescription, signature);
  }

  if (conciliationType === 'a') {
    return conciliationDischargeTemplate(prescription, signature);
  }

  return `Farmácia Clínica
${prescription.data.namePatient}, ${prescription.data.age}${
    prescription.data.weight ? `, ${prescription.data.weight}Kg` : ''
  }

Conciliação Medicamentosa realizada com:

1. Histórico de saúde:


2. Conciliação medicamentosa:
${getConciliationDrugList(
  prescription.prescription.list.length ? prescription.prescription.list[0].value : [],
  true
)}
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
  ${i.observation ? stripHtml(i.observation) : ''}
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
