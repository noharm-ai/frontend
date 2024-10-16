import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import FeatureService from "services/features";

const JourneySwitch = () => {
  const initialPage = useSelector((state) => state.preferences.app.initialPage);
  const features = useSelector((state) => state.user.account.features);
  const featureService = FeatureService(features);

  if (featureService.hasPrimaryCare()) {
    return <Navigate to="/pacientes" />;
  }

  return <Navigate to={initialPage} />;
};

export default JourneySwitch;
