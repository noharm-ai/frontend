import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { fetchScreeningThunk } from "store/ducks/prescriptions/thunk";
import { selectPrescriptionDrugThunk } from "store/ducks/prescriptionDrugs/thunk";

import security from "services/security";
import FeatureService from "services/features";
import Screening from "components/Screening";

const mapStateToProps = ({ prescriptions, user }) => ({
  error: prescriptions.single.error,
  message: prescriptions.single.message,
  isFetching: prescriptions.single.isFetching,
  content: prescriptions.single.data,
  interventions: prescriptions.single.intervention.list,
  security: security(user.account.roles),
  featureService: FeatureService(user.account.features),
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
