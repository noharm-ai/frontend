import {
  prescriptionTemplate,
  interventionTemplate,
  signatureTemplate,
  layoutTemplate
} from './templates';

const getInterventions = list => {
  return list
    .map(l => {
      if (l.status === 's') {
        return l.intervention;
      }

      return null;
    })
    .filter(i => i != null);
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

export default (prescription, account) => {
  const { prescription: prescriptions, solution: solutions, procedures } = prescription.data;
  const list = [...prescriptions, ...solutions, ...procedures];

  const interventions = groupByPrescription(getInterventions(list));
  console.log('group', interventions);

  const tpl = interventions.map((iList, p) => {
    const iTpl = iList.map(i => interventionTemplate(i));

    return prescriptionTemplate(p, iTpl.join(''));
  });

  return layoutTemplate(prescription.data, tpl.join(''), signatureTemplate(account));
};
