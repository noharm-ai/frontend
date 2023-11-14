import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { setNameThunk, cleanCacheThunk } from "store/ducks/patients/thunk";

import PatientName from "components/PatientName";

const mapStateToProps = ({ app, auth }) => ({
  app,
  access_token: auth.identify.access_token,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setName: setNameThunk,
      cleanCache: cleanCacheThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(PatientName);
