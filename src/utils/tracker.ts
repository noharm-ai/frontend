export const trackFeature = (
  trackedFeature: TrackedFeature,
  details: any = {}
) => {
  track(CustomEvent.FEATURE_ACCESS, {
    custom_event: trackedFeature,
    ...details,
  });
};

export const trackReport = (
  trackedReport: TrackedReport,
  details: any = {}
) => {
  track(CustomEvent.REPORT_ACCESS, {
    custom_event: trackedReport,
    ...details,
  });
};

const track = (customEvent: CustomEvent, details: any = {}) => {
  if (!(window as any).cwr) {
    console.log("tracking error: cwr undefined");
    return;
  }

  console.log(`track: ${customEvent}`, details);

  (window as any).cwr("recordEvent", {
    type: customEvent,
    data: details,
  });
};

enum CustomEvent {
  FEATURE_ACCESS = "FeatureAccess", // has used a tracked feature
  REPORT_ACCESS = "ReportAccess", // access to a report
}

export enum TrackedFeature {
  MODAL_EXAMS = "modal-exames",
  MODAL_CLINICAL_NOTES = "modal-evolucoes",
  MODAL_ALERTS = "modal-alertas",
}

export enum TrackedReport {
  CULTURES = "culturas",
  PRESCRIPTION_EVENT_HISTORY = "historico-eventos-prescricao",
  ANTIMICROBIAL_HISTORY = "historico-antimicrobiano",
  CUSTOM = "customizado",

  PATIENT_DAY = "paciente-dia",
  PRESCRIPTIONS = "prescricoes",
  INTERVENTIONS = "intervencoes",
  PRESCRIPTION_AUDIT = "auditoria-prescricoes",
  ECONOMY = "farmacoeconomia",
}
