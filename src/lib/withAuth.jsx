import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Navigate } from "react-router-dom";

import { logoutThunk } from "store/ducks/auth/thunk";
import appInfo from "utils/appInfo";

const noop = () => {};

const AuthHandler = ({
  logout,
  isLoginPage,
  isLogoutPage,
  currentVersion,
  component: Component,
  ...props
}) => {
  const isLogged = localStorage.getItem("ac1") != null;

  if (!isLoginPage && !isLogoutPage && !isLogged) {
    const schema = localStorage.getItem("schema");
    const oauth = localStorage.getItem("oauth");
    const maintainer = localStorage.getItem("maintainer");

    if (schema && oauth) {
      if (maintainer === "true") {
        return <Navigate to={`/login/noharm`} />;
      }

      return <Navigate to={`/login/${schema}`} />;
    }

    return <Navigate to="/login" />;
  }

  if (currentVersion !== appInfo.version && isLogged) {
    logout({ preventDefault: noop });
    return <Navigate to="/login" />;
  }

  try {
    if (window.cwr) {
      window.cwr("addSessionAttributes", {
        schema: localStorage.getItem("schema"),
      });
    }
  } catch {
    console.error("cwr set schema error");
  }

  return <Component {...props} />;
};

const mapStateToProps = ({ user, session, app }) => ({
  user,
  session,
  currentVersion: app.currentVersion,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      logout: logoutThunk,
    },
    dispatch
  );

const Auth = connect(mapStateToProps, mapDispatchToProps)(AuthHandler);

const AuthConnected = (props = {}) => <Auth {...props} />;

export default AuthConnected;
