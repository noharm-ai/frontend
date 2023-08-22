import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
  selectItemToSaveThunk,
  saveInterventionThunk,
  clearSavedInterventionStatusThunk,
  fetchReasonsListThunk,
  updateSelectedItemToSaveInterventionThunk,
} from "store/ducks/intervention/thunk";
import {
  updateInterventionDataThunk,
  checkInterventionThunk,
} from "store/ducks/prescriptions/thunk";
import {
  searchDrugsThunk,
  fetchDrugSummaryThunk,
} from "store/ducks/drugs/thunk";
import {
  memoryFetchReasonTextThunk,
  memorySaveReasonTextThunk,
} from "store/ducks/memory/thunk";

import Intervention from "components/Forms/Intervention";
import security from "services/security";

const mapStateToProps = ({ intervention, drugs, memory, user }) => ({
  intervention: intervention.maybeCreateOrUpdate,
  reasons: intervention.reasons,
  drugs: drugs.search,
  drugSummary: drugs.summary,
  reasonTextMemory: memory.reasonText,
  security: security(user.account.roles),
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      select: selectItemToSaveThunk,
      save: saveInterventionThunk,
      reset: clearSavedInterventionStatusThunk,
      updateInterventionData: updateInterventionDataThunk,
      saveInterventionStatus: checkInterventionThunk,
      fetchReasonsList: fetchReasonsListThunk,
      updateSelectedItemToSaveIntervention:
        updateSelectedItemToSaveInterventionThunk,
      searchDrugs: searchDrugsThunk,
      fetchDrugSummary: fetchDrugSummaryThunk,
      memorySaveReasonText: memorySaveReasonTextThunk,
      memoryFetchReasonText: memoryFetchReasonTextThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Intervention);
