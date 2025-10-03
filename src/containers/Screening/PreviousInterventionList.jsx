import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import PreviousInterventionList from "components/Screening/Intervention/PreviousInterventionList";

const mapStateToProps = ({ prescriptions, intervention }) => ({
  interventions: prescriptions.single.intervention.list,
  isFetching: prescriptions.single.isFetching,
  isSaving: intervention.maybeCreateOrUpdate.isSaving,
  admissionNumber: prescriptions.single.data.admissionNumber,
});
const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PreviousInterventionList);
