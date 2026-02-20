export default class Feature {
  static MICROMEDEX = "MICROMEDEX";
  static PRIMARYCARE = "PRIMARYCARE";
  static CONCILIATION = "CONCILIATION";
  static CONCILIATION_EDIT = "CONCILIATION_EDIT";
  static SOLUTION_FREQUENCY = "SOLUTION_FREQUENCY";
  static LOCK_CHECKED_PRESCRIPTION = "LOCK_CHECKED_PRESCRIPTION";
  static DISABLE_SOLUTION_TAB = "DISABLE_SOLUTION_TAB";
  static DISABLE_WHITELIST_GROUP = "DISABLE_WHITELIST_GROUP";
  static OAUTH = "OAUTH";
  static CLINICAL_NOTES_LEGACY_FORMAT = "CLINICAL_NOTES_LEGACY_FORMAT";
  static PATIENT_REVISION = "PATIENT_REVISION";
  static AUTHORIZATION_SEGMENT = "AUTHORIZATION_SEGMENT";
  static TRANSCRIPTION = "TRANSCRIPTION";
  static PRESCRIPTION_ALERT = "PRESCRIPTION_ALERT";
  static PRESMED_FORM = "PRESMED_FORM";
  static DISCHARGE_SUMMARY = "DISCHARGE_SUMMARY";
  static REGULATION = "REGULATION";
  static AUTOMATIC_CHECK_IF_NOT_VALIDATED_ITENS =
    "AUTOMATIC_CHECK_IF_NOT_VALIDATED_ITENS";
  static PROTOCOL_ALERTS = "PROTOCOL_ALERTS";
  static SHOW_PEP_LINK = "SHOW_PEP_LINK";
  static ADD_EXAMS = "ADD_EXAMS";
  static N0_AGENT = "N0_AGENT";
  static PATIENT_DAY_OUTPATIENT_FLOW = "PATIENT_DAY_OUTPATIENT_FLOW";
  static IGNORE_NON_CPOE_SEGMENTS = "IGNORE_NON_CPOE_SEGMENTS";
  static PEC = "PEC";
  static PRIORITIZATION_FIELD_SPECIALTY = "PRIORITIZATION_FIELD_SPECIALTY";

  // user features
  static DISABLE_GETNAME = "DISABLE_GETNAME";
  static DISABLE_CPOE = "DISABLE_CPOE";
  static STAGING_ACCESS = "STAGING_ACCESS";

  static getFeatures(t) {
    return [
      {
        id: Feature.MICROMEDEX,
        label: t(`features.${Feature.MICROMEDEX}`),
        description: t(`featuresDescription.${Feature.MICROMEDEX}`),
      },
      {
        id: Feature.PRIMARYCARE,
        label: t(`features.${Feature.PRIMARYCARE}`),
        description: t(`featuresDescription.${Feature.PRIMARYCARE}`),
      },
      {
        id: Feature.OAUTH,
        label: t(`features.${Feature.OAUTH}`),
        description: t(`featuresDescription.${Feature.OAUTH}`),
      },
      {
        id: Feature.CONCILIATION,
        label: t(`features.${Feature.CONCILIATION}`),
        description: t(`featuresDescription.${Feature.CONCILIATION}`),
      },
      {
        id: Feature.SOLUTION_FREQUENCY,
        label: t(`features.${Feature.SOLUTION_FREQUENCY}`),
        description: t(`featuresDescription.${Feature.SOLUTION_FREQUENCY}`),
      },
      {
        id: Feature.CONCILIATION_EDIT,
        label: t(`features.${Feature.CONCILIATION_EDIT}`),
        description: t(`featuresDescription.${Feature.CONCILIATION_EDIT}`),
      },
      {
        id: Feature.LOCK_CHECKED_PRESCRIPTION,
        label: t(`features.${Feature.LOCK_CHECKED_PRESCRIPTION}`),
        description: t(
          `featuresDescription.${Feature.LOCK_CHECKED_PRESCRIPTION}`,
        ),
      },
      {
        id: Feature.DISABLE_SOLUTION_TAB,
        label: t(`features.${Feature.DISABLE_SOLUTION_TAB}`),
        description: t(`featuresDescription.${Feature.DISABLE_SOLUTION_TAB}`),
      },
      {
        id: Feature.DISABLE_WHITELIST_GROUP,
        label: t(`features.${Feature.DISABLE_WHITELIST_GROUP}`),
        description: t(
          `featuresDescription.${Feature.DISABLE_WHITELIST_GROUP}`,
        ),
      },
      {
        id: Feature.CLINICAL_NOTES_LEGACY_FORMAT,
        label: t(`features.${Feature.CLINICAL_NOTES_LEGACY_FORMAT}`),
        description: t(
          `featuresDescription.${Feature.CLINICAL_NOTES_LEGACY_FORMAT}`,
        ),
      },
      {
        id: Feature.PATIENT_REVISION,
        label: t(`features.${Feature.PATIENT_REVISION}`),
        description: t(`featuresDescription.${Feature.PATIENT_REVISION}`),
      },
      {
        id: Feature.AUTHORIZATION_SEGMENT,
        label: "Autorização por Segmento",
        description:
          "Quando ativado, o usuário só conseguirá efetuar ações em segmentos onde tiver autorização. As autorizações são concedidas no cadastro do usuário. Lembre-se de conceder as autorizações antes de ativar esta feature.",
      },
      {
        id: Feature.TRANSCRIPTION,
        label: "Transcrição",
        description: "Habilita o formulário de transcrição",
      },
      {
        id: Feature.PRESCRIPTION_ALERT,
        label: "Alerta de Prescrição",
        description:
          "Habilita o botão Alerta. Ele permite registrar um texto de alerta para a prescrição.",
      },
      {
        id: Feature.PRESMED_FORM,
        label: "Formulário de Dispensação",
        description:
          "Habilita o botão o formulário de dispensação. Usuário deve possuir o papel Gestor de Dispensação para visualizar.",
      },
      {
        id: Feature.DISCHARGE_SUMMARY,
        label: "Sumário de Alta",
        description: "Habilita a funcionalidade de criação de Sumário de Alta.",
      },
      {
        id: Feature.REGULATION,
        label: "Regulação",
        description: "Habilita o módulo de Regulação.",
      },
      {
        id: Feature.AUTOMATIC_CHECK_IF_NOT_VALIDATED_ITENS,
        label: "Checagem automática (CPOE - Dietas)",
        description:
          "Habilita a checagem automática de pacientes-dia quando possui somente itens de dieta. Atualmente é exclusivo para CPOE.",
      },
      {
        id: Feature.PROTOCOL_ALERTS,
        label: "Alertas de protocolo",
        description:
          "Feature desabilitada. Protocolo está ativo para todos clientes",
      },
      {
        id: Feature.SHOW_PEP_LINK,
        label: "Link direto ao PEP",
        description:
          "Habilita a possibilidade de configurar um link direto para o PEP do cliente. Para habilitar, é necessário configuração extra feita manualmente.",
      },
      {
        id: Feature.ADD_EXAMS,
        label: "Adicionar exames",
        description:
          "Habilita a possibilidade de adicionar resultados de exames manualmente.",
      },
      {
        id: Feature.N0_AGENT,
        label: "N0-Copilot",
        description: "Habilita o N0-Copilot na abertura de chamados.",
      },
      {
        id: Feature.PATIENT_DAY_OUTPATIENT_FLOW,
        label: "Paciente-Dia: fluxo ambulatorial",
        description:
          "Habilita o fluxo de geração de prescrições Paciente-dia para ambulatórios. Neste fluxo, as prescrições paciente-dia só serão geradas nos dias onde houver um novo item de prescrição.",
      },
      {
        id: Feature.IGNORE_NON_CPOE_SEGMENTS,
        label: "CPOE: ignorar segmentos não CPOE na lista de medicamentos",
        description:
          "Com esta feature ativada, ao visualizar uma prescrição CPOE, serão exibidos apenas os medicamentos dos segmentos CPOE. Útil para clientes que desejam que o segmento quimioterápico não CPOE não 'polua' a lista de medicamentos do CPOE.",
      },
      {
        id: Feature.PEC,
        label: "PEC: identifica integração com o PEC",
        description:
          "Esta feature identifica integrações com o PEC (Prontuário Eletrônico do Cidadão). Sua ativação pode ser necessária para o funcionamento correto de certas funcionalidades relacionadas ao PEC.",
      },
      {
        id: Feature.PRIORITIZATION_FIELD_SPECIALTY,
        label: "Campo de priorizaçao: Especialidade",
        description: "Habilita o campo Especialidade no filtro de priorização.",
      },
    ];
  }
}
