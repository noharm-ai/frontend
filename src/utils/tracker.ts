export const trackReport = (
  trackedReport: TrackedReport,
  details: any = {}
) => {
  track(CustomEvent.REPORT_ACCESS, {
    custom_event: trackedReport,
    ...details,
  });
};

export const trackPrescriptionAction = (
  trackedAction: TrackedPrescriptionAction,
  details: any = {}
) => {
  track(CustomEvent.PRESCRIPTION_ACTION, {
    custom_event: trackedAction,
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
  REPORT_ACCESS = "ReportAccess", // access to a report
  PRESCRIPTION_ACTION = "PrescriptionAction", // ex. action
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

export enum TrackedPrescriptionAction {
  TAB_ADMISSION = "aba-atendimento",
  TAB_NOTES = "aba-anotacoes",
  TAB_MARKER = "aba-marcadores",
  TAB_PROTOCOL = "aba-protocolos",
  TAB_REPORTS = "aba-relatorios",
  TAB_DRUGS = "aba-medicamentos",
  TAB_PROCEDURES = "aba-procedimentos",
  TAB_SOLUTIONS = "aba-solucoes",
  TAB_DIET = "aba-dietas",
  TAB_INTERVENTIONS = "aba-intervencoes",
  SHOW_EXAMS = "abrir-exames",
  SHOW_CLINICAL_NOTES = "abrir-evolucoes",
  SHOW_ALERTS_MODAL = "abrir-modal-alertas",
  SHOW_EXTRA_INFO = "abrir-ver-mais",
  RECALCULATE_PRESCRIPTION = "recalcular-prescricao",
  EDIT_PATIENT = "editar-paciente",
  OPEN_CONCILIATION = "abrir-conciliacao",
  OPEN_PEP = "abrir_pep",
  OPEN_AGG_PRESCRIPTION = "abrir-prescricao-paciente-dia",
  ORDER_PRESCRIPTIONS = "ordernar-prescricoes",
  ORDER_DRUGS = "ordenar-medicamentos",
  COMPARE_DAYS = "comparar-vigencias",
  CONDENSED_LIST = "lista-condensada",
  ALERT_PERSPECTIVE = "perspectiva-alertas",
  MULTIPLE_SELECTION = "ativar-selecao-multipla",
  MULTIPLE_INTERVENTION = "enviar-intervencao-multipla",
  FILTER = "filtrar-medicamentos",
  EXPAND_ROW = "expandir-linha-medicamento",
  EXPAND_ALL = "expandir-todos",
  KEYBOARD_NAVIGATION = "navegacao-teclado",
  SHOW_LEAFLET = "abrir-bulario",
  SHOW_PERIOD = "abrir-periodo-uso",
  ADD_DRUG = "adicionar-medicamento",
  COPY_CONCILIATION = "copiar-conciliacao",
}
