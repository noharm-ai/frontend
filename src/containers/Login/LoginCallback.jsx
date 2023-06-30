import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { oauthLoginThunk } from "store/ducks/auth/thunk";
import LoginCallback from "components/Login/LoginCallback";

const mapStateToProps = ({ auth, user }) => ({
  ...auth,
  isLogging: user.isLogging,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      doLogin: oauthLoginThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(LoginCallback);
