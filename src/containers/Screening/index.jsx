import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { fetchScreeningThunk } from "store/ducks/prescriptions/thunk";
import { selectPrescriptionDrugThunk } from "store/ducks/prescriptionDrugs/thunk";

import security from "services/security";
import Screening from "components/Screening";

const mapStateToProps = ({ prescriptions, user }) => ({
  error: prescriptions.single.error,
  message: prescriptions.single.message,
  isFetching: prescriptions.single.isFetching,
  content: prescriptions.single.data,
  security: security(user.account.roles),
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchScreeningById: fetchScreeningThunk,
      selectPrescriptionDrug: selectPrescriptionDrugThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Screening);
