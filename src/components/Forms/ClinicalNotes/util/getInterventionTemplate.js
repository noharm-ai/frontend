import {
  prescriptionTemplate,
  conciliationTemplate,
  interventionTemplate,
  interventionCompleteTemplate,
  signatureTemplate,
  layoutTemplate,
} from "./templates";

export const getCurrentInterventions = (interventions, headers) => {
  return interventions.filter((i) => headers[i.idPrescription]);
};

const getInterventions = (prescription) => {
  const interventions = prescription.intervention.list;
  const items = [
    ...prescription.prescription.list,
    ...prescription.solution.list,
    ...prescription.procedure.list,
  ];
  const flatItems = [];
  items.forEach((g) => {
    flatItems.push(...g.value);
  });

  return interventions
    .filter((i) => i.status !== "0")
    .filter((i) => {
      return flatItems.find(
        (item) =>
          item.idPrescriptionDrug === i.id ||
          i.idPrescription === prescription.data.idPrescription
      );
    });
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
  conciliationType,
  cpoe
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

    if (cpoe) {
      return iTpl;
    }

    return prescriptionTemplate(k, iTpl.join(""), interventions[k][0]?.id);
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
