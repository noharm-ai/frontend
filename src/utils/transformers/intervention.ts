type InterventionLike = {
  id: string | number;
  idPrescription?: string | number;
  status?: string | number;
};

export const filterInterventionByPrescriptionDrug = (
  idPrescriptionDrug: string | number,
) => {
  return (i: InterventionLike) =>
    `${i.id}` === `${idPrescriptionDrug}` && i.status !== "0";
};

export const filterInterventionByPrescription = (
  idPrescription: string | number,
) => {
  return (i: InterventionLike) =>
    `${i.idPrescription}` === `${idPrescription}` &&
    `${i.id}` === "0" &&
    i.status !== "0";
};
