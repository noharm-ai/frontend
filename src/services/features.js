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

  const hasNoHarmCare = () => {
    return hasFeature(Feature.NOHARMCARE);
  };

  const hasConciliation = () => {
    return hasFeature(Feature.CONCILIATION);
  };

  const hasPrescriptionExpirationTag = () => {
    return hasFeature(Feature.PRESCRIPTION_EXPIRATION_TAG);
  };

  return {
    hasFeature,
    hasMicromedex,
    hasPrimaryCare,
    hasNoHarmCare,
    hasConciliation,
    hasPrescriptionExpirationTag,
  };
};

export default FeaturesService;
