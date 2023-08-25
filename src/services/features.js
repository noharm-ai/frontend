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

  const hasTempCpoePeriod = () => {
    return hasFeature(Feature.TEMP_CPOE_PERIOD);
  };

  const hasMultipleIntervention = () => {
    return hasFeature(Feature.MULTIPLE_INTERVENTION);
  };

  return {
    hasFeature,
    hasMicromedex,
    hasPrimaryCare,
    hasNoHarmCare,
    hasConciliation,
    hasTempCpoePeriod,
    hasMultipleIntervention,
  };
};

export default FeaturesService;
