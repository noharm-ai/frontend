import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
  fetchScreeningThunk,
  setModalVisibilityThunk,
} from "store/ducks/prescriptions/thunk";
import ScreeningActions from "components/Screening/ScreeningActions";
import security from "services/security";
import FeatureService from "services/features";

const mapStateToProps = ({ prescriptions, user }) => ({
  prescription: prescriptions.single.data,
  security: security(user.account.roles),
  featureService: FeatureService(user.account.features),
  patientEditVisible: prescriptions.single.actions.modalVisibility.patientEdit,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchScreening: fetchScreeningThunk,
      setModalVisibility: setModalVisibilityThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ScreeningActions);
