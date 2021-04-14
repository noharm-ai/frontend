import {
  prescriptionTemplate,
  conciliationTemplate,
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
          if (l.intervention && l.intervention.status === 's') {
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

  if (prescription.data.intervention) {
    list.push({
      key: 0,
      value: [
        {
          status: prescription.data.intervention.status,
          intervention: { ...prescription.data.intervention, idPrescription: 0 }
        }
      ]
    });
  }

  const interventions = groupByPrescription(getInterventions(list));

  const tpl = Object.keys(interventions).map(k => {
    const iTpl = interventions[k].map(i => interventionTemplate(i));

    if (prescription.data.concilia) {
      return conciliationTemplate(k, iTpl.join(''));
    }

    return prescriptionTemplate(k, iTpl.join(''));
  });

  return layoutTemplate(prescription.data, tpl.join(''), signatureTemplate(signature, account));
};
