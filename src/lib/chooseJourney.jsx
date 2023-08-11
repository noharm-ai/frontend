import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Navigate } from "react-router-dom";

import FeatureService from "services/features";
import security from "services/security";

const JourneySwitch = ({ journey, featureService, roles }) => {
  const sec = security(roles);

  if (sec.isDoctor()) {
    return <Navigate to="/sumario-alta" />;
  }

  if (featureService.hasPrimaryCare()) {
    return <Navigate to="/pacientes" />;
  }

  if (journey === "prescription") {
    return <Navigate to="/priorizacao/prescricoes" />;
  }

  if (journey === "conciliation") {
    return <Navigate to="/priorizacao/conciliacoes" />;
  }

  if (journey === "cards") {
    return <Navigate to="/priorizacao/pacientes/cards" />;
  }

  return <Navigate to="/priorizacao/pacientes" />;
};

const mapStateToProps = ({ app, user }) => ({
  journey: app.preferences.journey,
  featureService: FeatureService(user.account.features),
  roles: user.account.roles,
});
const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

const JourneySwitchComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(JourneySwitch);

const chooseJourney =
  () =>
  (props = {}) =>
    <JourneySwitchComponent {...props} />;

export default chooseJourney;
