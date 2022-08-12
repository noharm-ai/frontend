import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Navigate } from "react-router-dom";

import FeatureService from "services/features";

const JourneySwitch = ({ journey, featureService }) => {
  if (featureService.hasPrimaryCare()) {
    return <Navigate to="/pacientes" />;
  }

  if (journey === "prescription") {
    return <Navigate to="/priorizacao/prescricoes" />;
  }

  if (journey === "conciliation") {
    return <Navigate to="/priorizacao/conciliacoes" />;
  }

  return <Navigate to="/priorizacao/pacientes" />;
};

const mapStateToProps = ({ app, user }) => ({
  journey: app.preferences.journey,
  featureService: FeatureService(user.account.features),
});
const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

const JourneySwitchComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(JourneySwitch);

export default () =>
  (props = {}) =>
    <JourneySwitchComponent {...props} />;
