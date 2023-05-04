import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { cleanCacheThunk } from "store/ducks/patients/thunk";

import UserConfig from "components/UserConfig";

const mapStateToProps = ({ reports }) => ({ reports });
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      cleanCache: cleanCacheThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(UserConfig);
