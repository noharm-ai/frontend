import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { updateInterventionDataThunk } from "store/ducks/prescriptions/thunk";
import { saveInterventionThunk } from "store/ducks/intervention/thunk";
import PreviousInterventionList from "components/Screening/Intervention/PreviousInterventionList";

const mapStateToProps = ({ prescriptions, intervention }) => ({
  interventions: prescriptions.single.intervention.list,
  isFetching: prescriptions.single.isFetching,
  isSaving: intervention.maybeCreateOrUpdate.isSaving,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      save: saveInterventionThunk,
      updateList: updateInterventionDataThunk,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PreviousInterventionList);
