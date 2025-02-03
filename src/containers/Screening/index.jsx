import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { fetchScreeningThunk } from "store/ducks/prescriptions/thunk";
import { selectPrescriptionDrugThunk } from "store/ducks/prescriptionDrugs/thunk";

import Screening from "components/Screening";

const mapStateToProps = ({ prescriptions, user, serverActions }) => ({
  error: prescriptions.single.error,
  message: prescriptions.single.message,
  isFetching:
    prescriptions.single.isFetching ||
    serverActions.shouldUpdatePrescription.status === "loading",
  content: prescriptions.single.data,
  interventions: prescriptions.single.intervention.list,
  roles: user.account.roles,
  features: user.account.features,
  permissions: user.account.permissions,
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
