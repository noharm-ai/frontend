import {
  prescriptionTemplate,
  interventionTemplate,
  signatureTemplate,
  layoutTemplate
} from './templates';

const getInterventions = list => {
  const interventionList = [];

  list.forEach(group => {
    interventionList.push(
      ...group.value
        .map(l => {
          if (l.status === 's') {
            return l.intervention;
          }

          return null;
        })
        .filter(i => i != null)
    );
  });

  return interventionList;
};

const groupByPrescription = list => {
  const items = [];

  list.forEach(i => {
    if (items[i.idPrescription]) {
      items[i.idPrescription].push(i);
    } else {
      items[i.idPrescription] = [i];
    }
  });

  return items;
};

export default (prescription, account, signature) => {
  const list = [
    ...prescription.prescription.list,
    ...prescription.solution.list,
    ...prescription.procedure.list
  ];

  const interventions = groupByPrescription(getInterventions(list));

  const tpl = interventions.map((iList, p) => {
    const iTpl = iList.map(i => interventionTemplate(i));

    return prescriptionTemplate(p, iTpl.join(''));
  });

  return layoutTemplate(prescription.data, tpl.join(''), signatureTemplate(signature, account));
};
