export default class Feature {
  static MICROMEDEX = "MICROMEDEX";
  static PRIMARYCARE = "PRIMARYCARE";
  static CONCILIATION = "CONCILIATION";
  static SOLUTION_FREQUENCY = "SOLUTION_FREQUENCY";
  static LOCK_CHECKED_PRESCRIPTION = "LOCK_CHECKED_PRESCRIPTION";
  static DISABLE_SOLUTION_TAB = "DISABLE_SOLUTION_TAB";
  static OAUTH = "OAUTH";
  static CLINICAL_NOTES_NEW_FORMAT = "CLINICAL_NOTES_NEW_FORMAT";
  static PATIENT_REVISION = "PATIENT_REVISION";
  static INTERVENTION_V2 = "INTERVENTION_V2";
  static AUTHORIZATION_SEGMENT = "AUTHORIZATION_SEGMENT";
  static DISABLE_ALERT_GROUPS = "DISABLE_ALERT_GROUPS";

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
        id: Feature.LOCK_CHECKED_PRESCRIPTION,
        label: t(`features.${Feature.LOCK_CHECKED_PRESCRIPTION}`),
        description: t(
          `featuresDescription.${Feature.LOCK_CHECKED_PRESCRIPTION}`
        ),
      },
      {
        id: Feature.DISABLE_SOLUTION_TAB,
        label: t(`features.${Feature.DISABLE_SOLUTION_TAB}`),
        description: t(`featuresDescription.${Feature.DISABLE_SOLUTION_TAB}`),
      },
      {
        id: Feature.CLINICAL_NOTES_NEW_FORMAT,
        label: t(`features.${Feature.CLINICAL_NOTES_NEW_FORMAT}`),
        description: t(
          `featuresDescription.${Feature.CLINICAL_NOTES_NEW_FORMAT}`
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
          "Quando ativado, o usuário só conseguirá efetuar ações em segmentos onde tiver autorização. As autorizações são concedidas no cadastro do usuário.",
      },
      {
        id: Feature.DISABLE_ALERT_GROUPS,
        label: "Desabilita agrupamento de alertas",
        description:
          "Esta feature faz com que o agrupamento de alertas na tela de prescrição seja desativado, voltando ao modo de visualização antigo.",
      },
    ];
  }
}
