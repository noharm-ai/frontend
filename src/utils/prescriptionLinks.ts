/**
 * URLs that open the prescription screen, optionally with one of its modals
 * already open (deep link). The same constants are used to build the links
 * (custom reports) and to consume them on the prescription screen
 * (`hooks/usePrescriptionDeepLink`), so both sides stay in sync.
 */

export const PRESCRIPTION_MODAL_PARAM = "modal";
export const EXAM_ID_PARAM = "fkexame";
export const CLINICAL_NOTE_ID_PARAM = "fkevolucao";

export const PrescriptionModal = {
  EXAMS: "exames",
  CLINICAL_NOTES: "evolucoes",
  ALERTS: "alertas",
} as const;

export type PrescriptionModalType =
  (typeof PrescriptionModal)[keyof typeof PrescriptionModal];

export const DEEP_LINK_PARAMS = [
  PRESCRIPTION_MODAL_PARAM,
  EXAM_ID_PARAM,
  CLINICAL_NOTE_ID_PARAM,
];

export interface PrescriptionDeepLink {
  modal: PrescriptionModalType;
  fkexame?: string;
  fkevolucao?: string;
}

const DIGITS = /^\d+$/;

const isPrescriptionModal = (value: string): value is PrescriptionModalType =>
  (Object.values(PrescriptionModal) as string[]).includes(value);

const toId = (value: string | null | undefined): string | undefined =>
  value && DIGITS.test(value) && Number(value) > 0 ? value : undefined;

export const buildPrescriptionUrl = (
  id: string,
  options: Partial<PrescriptionDeepLink> = {},
): string => {
  const params = new URLSearchParams();

  if (options.modal) {
    params.set(PRESCRIPTION_MODAL_PARAM, options.modal);
  }
  if (options.fkexame) {
    params.set(EXAM_ID_PARAM, options.fkexame);
  }
  if (options.fkevolucao) {
    params.set(CLINICAL_NOTE_ID_PARAM, options.fkevolucao);
  }

  const query = params.toString();
  return `/prescricao/${id}${query ? `?${query}` : ""}`;
};

export const buildConciliationUrl = (id: string): string =>
  `/conciliacao/${id}`;

/** Most recent prescription of the admission (resolved by the route). */
export const buildAdmissionPrescriptionUrl = (admissionNumber: string): string =>
  `/prescricao/atendimento/${admissionNumber}`;

/**
 * Reads a deep link from the URL. Returns null when there is no valid `modal`
 * param; ids that are not positive integers are dropped.
 */
export const parsePrescriptionDeepLink = (
  searchParams: URLSearchParams,
): PrescriptionDeepLink | null => {
  const modal = searchParams.get(PRESCRIPTION_MODAL_PARAM);

  if (!modal || !isPrescriptionModal(modal)) {
    return null;
  }

  return {
    modal,
    fkexame: toId(searchParams.get(EXAM_ID_PARAM)),
    fkevolucao: toId(searchParams.get(CLINICAL_NOTE_ID_PARAM)),
  };
};

export const hasDeepLinkParams = (searchParams: URLSearchParams): boolean =>
  DEEP_LINK_PARAMS.some((param) => searchParams.has(param));
