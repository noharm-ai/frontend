import {
  prescriptionTemplate,
  conciliationTemplate,
  interventionTemplate,
  interventionCompleteTemplate,
  signatureTemplate,
  layoutTemplate,
} from "./templates";

const getInterventions = (prescription) => {
  const list = [
    ...prescription.prescription.list,
    ...prescription.solution.list,
    ...prescription.procedure.list,
  ];

  if (prescription.data.intervention) {
    list.push({
      key: 0,
      value: [
        {
          status: prescription.data.intervention.status,
          intervention: {
            ...prescription.data.intervention,
            idPrescription: 0,
          },
        },
      ],
    });
  }

  const interventionList = [];

  list.forEach((group) => {
    interventionList.push(
      ...group.value
        .map((l) => {
          if (l.intervention && l.intervention.status === "s") {
            return {
              drugName: l.drug,
              ...l.intervention,
            };
          }

          return null;
        })
        .filter((i) => i != null)
    );
  });

  return interventionList;
};

const groupByPrescription = (list) => {
  const items = [];

  list.forEach((i) => {
    if (items[i.idPrescription]) {
      items[i.idPrescription].push(i);
    } else {
      items[i.idPrescription] = [i];
    }
  });

  return items;
};

const getInterventionTemplate = (
  prescription,
  account,
  signature,
  conciliationType
) => {
  if (prescription.data.concilia) {
    const interventions = getInterventions(prescription);
    const tplInterventions = interventions.map((i) => interventionTemplate(i));

    return conciliationTemplate(
      prescription,
      tplInterventions.join(""),
      signatureTemplate(signature, account),
      conciliationType
    );
  }

  const interventions = groupByPrescription(getInterventions(prescription));

  const tpl = Object.keys(interventions).map((k) => {
    const iTpl = interventions[k].map((i) => interventionTemplate(i));

    return prescriptionTemplate(k, iTpl.join(""));
  });

  return layoutTemplate(
    prescription.data,
    tpl.join(""),
    signatureTemplate(signature, account)
  );
};

export const getInterventionList = (prescription) => {
  const interventions = getInterventions(prescription);

  const tpl = interventions.map((i) => {
    const iTpl = interventionCompleteTemplate(i);
    return iTpl;
  });

  return tpl.join("");
};

export default getInterventionTemplate;
