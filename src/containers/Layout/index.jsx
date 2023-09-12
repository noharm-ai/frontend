import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { logoutThunk } from "store/ducks/auth/thunk";
import { setSiderThunk, setNotificationThunk } from "store/ducks/app/thunk";
import Layout from "components/Layout";
import security from "services/security";
import FeatureService from "services/features";

const mapStateToProps = ({ auth, user, app }) => ({
  user,
  app,
  security: security(user.account.roles),
  featureService: FeatureService(user.account.features),
  access_token: auth.identify.access_token,
  logoutUrl: app.config.logoutUrl,
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
