import isEmpty from "lodash.isempty";

import Feature from "models/Feature";

const FeaturesService = (features) => {
  const hasFeature = (f) => {
    if (isEmpty(features)) return false;

    return features.indexOf(f) !== -1;
  };

  const hasMicromedex = () => {
    return hasFeature(Feature.MICROMEDEX);
  };

  const hasPrimaryCare = () => {
    return hasFeature(Feature.PRIMARYCARE);
  };

  const hasConciliation = () => {
    return hasFeature(Feature.CONCILIATION);
  };

  const hasSolutionFrequency = () => {
    return hasFeature(Feature.SOLUTION_FREQUENCY);
  };

  const hasLockCheckedPrescription = () => {
    return hasFeature(Feature.LOCK_CHECKED_PRESCRIPTION);
  };

  const hasDisableSolutionTab = () => {
    return hasFeature(Feature.DISABLE_SOLUTION_TAB);
  };

  const hasClinicalNotesNewFormat = () => {
    return hasFeature(Feature.CLINICAL_NOTES_NEW_FORMAT);
  };

  return {
    hasFeature,
    hasMicromedex,
    hasPrimaryCare,
    hasConciliation,
    hasSolutionFrequency,
    hasLockCheckedPrescription,
    hasDisableSolutionTab,
    hasClinicalNotesNewFormat,
  };
};

export default FeaturesService;
