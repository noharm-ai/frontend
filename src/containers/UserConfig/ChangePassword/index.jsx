import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { updatePasswordThunk } from "store/ducks/user/thunk";

import ChangePassword from "components/UserConfig/ChangePassword";

const mapStateToProps = ({ user }) => ({ status: user.save });
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updatePassword: updatePasswordThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword);
