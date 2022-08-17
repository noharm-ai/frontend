import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { selectItemToSaveThunk } from "store/ducks/intervention/thunk";
import { fetchScreeningThunk } from "store/ducks/prescriptions/thunk";
import Patient from "components/Screening/Patient";
import security from "services/security";
import FeatureService from "services/features";

const mapStateToProps = ({ prescriptions, auth, user, app }) => ({
  isFetching: prescriptions.single.isFetching,
  prescription: prescriptions.single.data,
  checkPrescriptionDrug: prescriptions.single.patient.checkPrescriptionDrug,
  access_token: auth.identify.access_token,
  security: security(user.account.roles),
  featureService: FeatureService(user.account.features),
  siderCollapsed: app.sider.collapsed,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchScreening: fetchScreeningThunk,
      selectIntervention: selectItemToSaveThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Patient);
