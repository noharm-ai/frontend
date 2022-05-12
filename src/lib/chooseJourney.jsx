import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Redirect } from 'react-router-dom';

import FeatureService from '@services/features';

const JourneySwitch = ({ journey, featureService }) => {
  if (featureService.hasPrimaryCare()) {
    return <Redirect to="/pacientes" />;
  }

  if (journey === 'prescription') {
    return <Redirect to="/priorizacao/prescricoes" />;
  }

  if (journey === 'conciliation') {
    return <Redirect to="/priorizacao/conciliacoes" />;
  }

  return <Redirect to="/priorizacao/pacientes" />;
};

const mapStateToProps = ({ app, user }) => ({
  journey: app.preferences.journey,
  featureService: FeatureService(user.account.features)
});
const mapDispatchToProps = dispatch => bindActionCreators({}, dispatch);

const JourneySwitchComponent = connect(mapStateToProps, mapDispatchToProps)(JourneySwitch);

export default () => (props = {}) => <JourneySwitchComponent {...props} />;
