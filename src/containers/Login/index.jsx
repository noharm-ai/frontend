import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { loginThunk } from "store/ducks/auth/thunk";
import Login from "components/Login";

const mapStateToProps = ({ auth, user }) => ({
  ...auth,
  isLogging: user.isLogging,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      doLogin: loginThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Login);
