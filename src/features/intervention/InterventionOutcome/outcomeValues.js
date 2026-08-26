export const OUTCOME_CLASSIFICATION = {
  SKIP_CLOSED: "skip-closed",
  SKIP_ARCHIVED: "skip-archived",
  AUTO: "auto",
  REVIEW: "review",
};

export const getOutcomeDefaults = (outcomeData, outcome) => {
  if (outcomeData.header?.readonly) {
    return {
      economyDayValueManual: outcomeData.header?.economyDayValueManual,
      economyDayValue: outcomeData.header?.economyDayValue,
      economyDayAmountManual: outcomeData.header?.economyDayAmountManual,
      economyDayAmount: outcomeData.header?.economyDayAmount,
    };
  }

  if (outcomeData.header?.economyType === 3) {
    return {
      economyDayValueManual: true,
      economyDayValue: outcomeData.header?.economyDayValue,
      economyDayAmountManual: true,
      economyDayAmount: null,
    };
  }

  if (outcome === "a") {
    return {
      economyDayValueManual: false,
      economyDayValue: outcomeData.header?.economyDayValue,
      economyDayAmountManual: false,
      economyDayAmount: null,
    };
  }

  return {
    economyDayValueManual: true,
    economyDayValue: "0",
    economyDayAmountManual: true,
    economyDayAmount: 1,
  };
};

export const buildOutcomeInitialValues = (outcomeData, outcome) => ({
  idIntervention: outcomeData.idIntervention,
  outcome,
  origin: outcomeData.origin?.item || {},
  idPrescriptionDrugDestiny:
    outcomeData.destiny?.length > 0
      ? outcomeData.destiny[0].item.idPrescriptionDrug
      : null,
  destiny: outcomeData.destiny?.length > 0 ? outcomeData.destiny[0].item : {},
  ...getOutcomeDefaults(outcomeData, outcome),
});

export const classifyOutcomeData = (outcomeData, outcome) => {
  if (outcomeData.header?.archived) {
    return OUTCOME_CLASSIFICATION.SKIP_ARCHIVED;
  }

  if (outcomeData.header?.status !== "s") {
    return OUTCOME_CLASSIFICATION.SKIP_CLOSED;
  }

  if (["n", "j", "x"].indexOf(outcome) !== -1) {
    return OUTCOME_CLASSIFICATION.AUTO;
  }

  const economyType = outcomeData.header?.economyType;

  if (economyType == null) {
    return OUTCOME_CLASSIFICATION.AUTO;
  }

  if (
    economyType === 1 &&
    outcomeData.header?.economyDayValue != null &&
    !outcomeData.header?.invalidSegment
  ) {
    return OUTCOME_CLASSIFICATION.AUTO;
  }

  return OUTCOME_CLASSIFICATION.REVIEW;
};
