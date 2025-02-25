import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import FeatureService from "services/features";
import Permission from "models/Permission";

const JourneySwitch = () => {
  const initialPage = useSelector((state) => state.preferences.app.initialPage);
  const features = useSelector((state) => state.user.account.features);
  const permissions = useSelector((state) => state.user.account.permissions);
  const featureService = FeatureService(features);

  if (featureService.hasPrimaryCare()) {
    return <Navigate to="/pacientes" />;
  }

  if (
    permissions &&
    permissions.includes(Permission.READ_REGULATION) &&
    !permissions.includes(Permission.READ_PRESCRIPTION)
  ) {
    return <Navigate to="/regulacao" />;
  }

  return <Navigate to={initialPage} />;
};

export default JourneySwitch;
