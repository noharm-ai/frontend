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

export const trackInterventionAction = (
  trackedAction: TrackedInterventionAction,
  details: any = {}
) => {
  track(CustomEvent.INTERVENTION_ACTION, {
    custom_event: trackedAction,
    ...details,
  });
};

const track = (customEvent: CustomEvent, details: any = {}) => {
  if (!(window as any).cwr) {
    console.log("tracking error: cwr undefined");
    return;
  }

  console.debug(`track: ${customEvent}`, details);

  (window as any).cwr("recordEvent", {
    type: customEvent,
    data: details,
  });
};

enum CustomEvent {
  REPORT_ACCESS = "ReportAccess", // access to a report
  PRESCRIPTION_ACTION = "PrescriptionAction", // ex. action in screening prescription
  INTERVENTION_ACTION = "InterventionAction", // action in intervention form
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
  EXPAND_DATE_GROUP = "expandir-vigencia",
  EXPAND_PRESCRIPTION = "expandir-prescricao",
  EXPAND_SOLUTION_CALCULATOR = "expandir-calculadora-solucao",
  KEYBOARD_NAVIGATION = "navegacao-teclado",
  SHOW_LEAFLET = "abrir-bulario",
  SHOW_PERIOD = "abrir-periodo-uso",
  ADD_DRUG = "adicionar-medicamento",
  ADD_DRUG_INDIVIDUAL = "adicionar-medicamento-individual",
  COPY_CONCILIATION = "copiar-conciliacao",
  CLICK_CHECK = "checar",
  CLICK_CHECK_INDIVIDUAL = "checar-individual",
  CLICK_UNCHECK_INDIVIDUAL = "deschecar-individual",
  CLICK_SHOW_INDIVIDUAL = "abrir-prescricao-individual",
  CLICK_COPY_DRUGS_INDIVIDUAL = "copiar-medicamentos-prescricao-individual",
  CLICK_REVIEW = "revisar",
  CLICK_CLINICAL_NOTES_FORM = "abrir-form-evolucao",
  CLICK_ALERT_FORM = "abrir-form-alerta",
  CLICK_CLOSE = "fechar-prescricao",
  CLICK_FLOAT_MENU = "click-menu-flutuante",
  CLICK_INTERVENTION = "abrir-intervencao",
  CLICK_PATIENT_INTERVENTION = "abrir-intervencao-paciente",
  CLICK_DRUG_NOTES = "abrir-anotacao-medicamento",
}

export enum TrackedInterventionAction {
  ENABLE_RAM = "ativar-ram",
  ENABLE_TRANSCRIPTION = "ativar-transcricao",
  CLICK_NARANJO = "click-naranjo",
  SAVE_DEFAULT_TEXT = "salvar-texto-padrao",
  LOAD_DEFAULT_TEXT = "aplicar-texto-padrao",
  DEFAULT_TEXT_VARIABLE = "variavel-texto-padrao",
  CLICK_SAVE = "click-salvar",
}
