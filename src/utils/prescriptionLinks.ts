/**
 * URLs that open the prescription screen, used by the link columns of custom
 * reports.
 */

export const buildPrescriptionUrl = (id: string): string => `/prescricao/${id}`;

/** Most recent prescription of the admission (resolved by the route). */
export const buildAdmissionPrescriptionUrl = (admissionNumber: string): string =>
  `/prescricao/atendimento/${admissionNumber}`;
