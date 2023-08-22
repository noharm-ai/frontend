export const filterInterventionByPrescriptionDrug = (idPrescriptionDrug) => {
  return (i) => `${i.id}` === `${idPrescriptionDrug}` && i.status !== "0";
};
