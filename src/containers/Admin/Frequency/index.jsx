import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { fetchFrequencyListThunk } from "store/ducks/admin/frequency/thunk";

import security from "services/security";
import Frequency from "components/Admin/Frequency";

const mapStateToProps = ({ user, admin }) => ({
  security: security(user.account.roles),
  error: admin.frequency.error,
  list: admin.frequency.list,
  isFetching: admin.frequency.isFetching,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchList: fetchFrequencyListThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Frequency);
