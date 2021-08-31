import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Redirect } from 'react-router-dom';

import { logoutThunk } from '@store/ducks/auth/thunk';
import appInfo from '@utils/appInfo';

const noop = () => {};
const initialPage = '/';

const AuthHandler = ({
  user,
  logout,
  session,
  isLoginPage,
  isLogoutPage,
  currentVersion,
  component: Component,
  ...props
}) => {
  const { isLogged } = user;

  if (!isLoginPage && !isLogoutPage && !isLogged) {
    return <Redirect to="/login" />;
  }

  if (isLoginPage && isLogged) {
    return <Redirect to={initialPage} />;
  }

  if (currentVersion !== appInfo.version && isLogged) {
    logout({ preventDefault: noop });
    return <Redirect to="/login" />;
  }

  return <Component {...props} />;
};

const mapStateToProps = ({ user, session, app }) => ({
  user,
  session,
  currentVersion: app.currentVersion
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      logout: logoutThunk
    },
    dispatch
  );

const Auth = connect(mapStateToProps, mapDispatchToProps)(AuthHandler);

export default config => (props = {}) => <Auth {...config} {...props} />;
