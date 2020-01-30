import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Redirect } from 'react-router-dom';

import { logoutThunk } from '@store/ducks/auth/thunk';

const noop = () => {};
const initialPage = '/';

const AuthHandler = ({ user, logout, session, isLoginPage, component: Component, ...props }) => {
  const { isFirstAccess } = session;
  const { isLogged, keepMeLogged } = user;

  useEffect(() => {
    if (isFirstAccess && isLogged && !keepMeLogged) {
      logout({ preventDefault: noop });
    }
  }, [isFirstAccess, isLogged, keepMeLogged, logout]);

  if (!isLoginPage && !isLogged) {
    return <Redirect to="/login" />;
  }

  if (isLoginPage && isLogged) {
    return <Redirect to={initialPage} />;
  }

  return <Component {...props} />;
};

const mapStateToProps = ({ user, session }) => ({ user, session });
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      logout: logoutThunk
    },
    dispatch
  );

const Auth = connect(mapStateToProps, mapDispatchToProps)(AuthHandler);

export default config => (props = {}) => <Auth {...config} {...props} />;
