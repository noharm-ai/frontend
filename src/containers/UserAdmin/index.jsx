import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
  fetchUsersListThunk,
  selectUserThunk,
} from "store/ducks/userAdmin/thunk";
import UserAdmin from "components/UserAdmin";

const mapStateToProps = ({ users }) => ({
  error: users.error,
  list: users.list,
  isFetching: users.isFetching,
  single: users.single,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchUsersList: fetchUsersListThunk,
      selectUser: selectUserThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(UserAdmin);
