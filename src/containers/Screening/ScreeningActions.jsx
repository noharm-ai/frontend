import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
  fetchScreeningThunk,
  setModalVisibilityThunk,
  checkScreeningThunk,
} from "store/ducks/prescriptions/thunk";
import ScreeningActions from "components/Screening/ScreeningActions";

const mapStateToProps = ({ prescriptions, user }) => ({
  prescription: prescriptions.single.data,
  patientEditVisible: prescriptions.single.actions.modalVisibility.patientEdit,
  clinicalNotesVisible:
    prescriptions.single.actions.modalVisibility.clinicalNotes,
  roles: user.account.roles,
  features: user.account.features,
  interventions: prescriptions.single.intervention.list,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchScreening: fetchScreeningThunk,
      checkScreening: checkScreeningThunk,
      setModalVisibility: setModalVisibilityThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ScreeningActions);
