import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { checkInterventionThunk } from "store/ducks/prescriptions/thunk";
import PreviousInterventionList from "components/Screening/Intervention/PreviousInterventionList";

const mapStateToProps = ({ prescriptions }) => ({
  interventions: prescriptions.single.intervention.list,
  isFetching: prescriptions.single.isFetching,
  checkIntervention: prescriptions.single.intervention.checkIntervention,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      saveInterventionStatus: checkInterventionThunk,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PreviousInterventionList);
