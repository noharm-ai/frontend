export default class Feature {
  static MICROMEDEX = "MICROMEDEX";
  static PRIMARYCARE = "PRIMARYCARE";
  static CONCILIATION = "CONCILIATION";
  static SOLUTION_FREQUENCY = "SOLUTION_FREQUENCY";
  static LOCK_CHECKED_PRESCRIPTION = "LOCK_CHECKED_PRESCRIPTION";
  static DISABLE_SOLUTION_TAB = "DISABLE_SOLUTION_TAB";

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
    ];
  }
}
