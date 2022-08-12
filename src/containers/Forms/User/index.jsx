import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { saveUserThunk } from "store/ducks/userAdmin/thunk";

import FormUser from "components/Forms/User";
import security from "services/security";

const mapStateToProps = ({ users, user }) => ({
  saveStatus: users.save,
  user: users.single,
  security: security(user.account.roles),
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      save: saveUserThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(FormUser);
