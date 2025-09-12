import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { logoutThunk } from "store/ducks/auth/thunk";
import { setSiderThunk, setNotificationThunk } from "store/ducks/app/thunk";
import Layout from "components/Layout";

const mapStateToProps = ({ auth, user, app, segments }) => ({
  user,
  app,
  access_token: auth.identify.access_token,
  logoutUrl: app.config.logoutUrl,
  segments: segments.list,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      doLogout: logoutThunk,
      setAppSider: setSiderThunk,
      setNotification: setNotificationThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
