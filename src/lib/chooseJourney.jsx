import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import FeatureService from "services/features";
import security from "services/security";

const JourneySwitch = () => {
  const initialPage = useSelector((state) => state.preferences.app.initialPage);
  const roles = useSelector((state) => state.user.account.roles);
  const features = useSelector((state) => state.user.account.features);
  const securityService = security(roles);
  const featureService = FeatureService(features);

  if (securityService.isDoctor()) {
    return <Navigate to="/sumario-alta" />;
  }

  if (featureService.hasPrimaryCare()) {
    return <Navigate to="/pacientes" />;
  }

  return <Navigate to={initialPage} />;
};

export default JourneySwitch;
