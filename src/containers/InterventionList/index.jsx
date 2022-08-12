import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
  fetchListThunk,
  checkInterventionThunk,
  selectItemToSaveThunk,
  saveInterventionThunk,
  updateInterventionListDataThunk,
  clearSavedInterventionStatusThunk,
  fetchFuturePrescriptionThunk,
  fetchReasonsListThunk,
} from "store/ducks/intervention/thunk";

import InterventionList from "components/InterventionList";

const mapStateToProps = ({ intervention }) => ({
  isFetching: intervention.isFetching,
  list: intervention.list,
  error: intervention.error,
  checkData: intervention.check,
  futurePrescription: intervention.futurePrescription,
  reasons: intervention.reasons.list,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchList: fetchListThunk,
      fetchFuturePrescription: fetchFuturePrescriptionThunk,
      checkIntervention: checkInterventionThunk,
      select: selectItemToSaveThunk,
      save: saveInterventionThunk,
      reset: clearSavedInterventionStatusThunk,
      updateList: updateInterventionListDataThunk,
      fetchReasonsList: fetchReasonsListThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(InterventionList);
