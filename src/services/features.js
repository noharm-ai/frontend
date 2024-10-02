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

  const hasConciliationEdit = () => {
    return hasFeature(Feature.CONCILIATION_EDIT);
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

  const hasClinicalNotesLegacyFormat = () => {
    return hasFeature(Feature.CLINICAL_NOTES_LEGACY_FORMAT);
  };

  const hasPatientRevision = () => {
    return hasFeature(Feature.PATIENT_REVISION);
  };

  const hasAuthorizationSegment = () => {
    return hasFeature(Feature.AUTHORIZATION_SEGMENT);
  };

  const hasDisableWhitelistGroup = () => {
    return hasFeature(Feature.DISABLE_WHITELIST_GROUP);
  };

  const hasTranscription = () => {
    return hasFeature(Feature.TRANSCRIPTION);
  };

  const hasPrescriptionAlert = () => {
    return hasFeature(Feature.PRESCRIPTION_ALERT);
  };

  return {
    hasFeature,
    hasMicromedex,
    hasPrimaryCare,
    hasConciliation,
    hasConciliationEdit,
    hasSolutionFrequency,
    hasLockCheckedPrescription,
    hasDisableSolutionTab,
    hasClinicalNotesLegacyFormat,
    hasPatientRevision,
    hasAuthorizationSegment,
    hasDisableWhitelistGroup,
    hasTranscription,
    hasPrescriptionAlert,
  };
};

export default FeaturesService;
