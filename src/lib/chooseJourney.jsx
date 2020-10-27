import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Redirect } from 'react-router-dom';

const JourneySwitch = ({ journey }) => {
  if (journey === 'prescription') {
    return <Redirect to="/priorizacao/prescricoes" />;
  }

  return <Redirect to="/priorizacao/pacientes" />;
};

const mapStateToProps = ({ app }) => ({ journey: app.preferences.journey });
const mapDispatchToProps = dispatch => bindActionCreators({}, dispatch);

const JourneySwitchComponent = connect(mapStateToProps, mapDispatchToProps)(JourneySwitch);

export default () => (props = {}) => <JourneySwitchComponent {...props} />;
