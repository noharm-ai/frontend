import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { selectItemToSaveThunk } from "store/ducks/intervention/thunk";
import {
  fetchScreeningThunk,
  setModalVisibilityThunk,
  removeNotesThunk,
} from "store/ducks/prescriptions/thunk";
import Patient from "components/Screening/Patient";

const mapStateToProps = ({ prescriptions, auth, user, app }) => ({
  isFetching: prescriptions.single.isFetching,
  prescription: prescriptions.single.data,
  checkPrescriptionDrug: prescriptions.single.patient.checkPrescriptionDrug,
  access_token: auth.identify.access_token,
  siderCollapsed: app.sider.collapsed,
  interventions: prescriptions.single.intervention.list,
  features: user.account.features,
  roles: user.account.roles,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchScreening: fetchScreeningThunk,
      selectIntervention: selectItemToSaveThunk,
      setModalVisibility: setModalVisibilityThunk,
      removeNotes: removeNotesThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Patient);
