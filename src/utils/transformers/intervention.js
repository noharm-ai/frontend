export const filterInterventionByPrescriptionDrug = (idPrescriptionDrug) => {
  return (i) => `${i.id}` === `${idPrescriptionDrug}` && i.status !== "0";
};

export const filterInterventionByPrescription = (idPrescription) => {
  return (i) =>
    `${i.idPrescription}` === `${idPrescription}` &&
    `${i.id}` === "0" &&
    i.status !== "0";
};
