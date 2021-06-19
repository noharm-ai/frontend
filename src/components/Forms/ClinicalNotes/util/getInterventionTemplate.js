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
            return {
              drugName: l.drug,
              ...l.intervention
            };
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

  if (prescription.data.concilia) {
    const interventions = getInterventions(list);
    const tplInterventions = interventions.map(i => interventionTemplate(i));

    return conciliationTemplate(
      prescription,
      tplInterventions.join(''),
      signatureTemplate(signature, account)
    );
  }

  const interventions = groupByPrescription(getInterventions(list));

  const tpl = Object.keys(interventions).map(k => {
    const iTpl = interventions[k].map(i => interventionTemplate(i));

    return prescriptionTemplate(k, iTpl.join(''));
  });

  return layoutTemplate(prescription.data, tpl.join(''), signatureTemplate(signature, account));
};
