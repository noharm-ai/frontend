import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
  selectItemToSaveThunk,
  saveInterventionThunk,
  clearSavedInterventionStatusThunk,
  fetchReasonsListThunk,
  updateSelectedItemToSaveInterventionThunk,
} from "store/ducks/intervention/thunk";
import { updateInterventionDataThunk } from "store/ducks/prescriptions/thunk";
import {
  searchDrugsThunk,
  fetchDrugSummaryThunk,
} from "store/ducks/drugs/thunk";
import {
  memoryFetchReasonTextThunk,
  memorySaveReasonTextThunk,
} from "store/ducks/memory/thunk";

import Intervention from "components/Forms/Intervention";

const mapStateToProps = ({ intervention, drugs, memory, user }) => ({
  intervention: intervention.maybeCreateOrUpdate,
  reasons: intervention.reasons,
  drugs: drugs.search,
  drugSummary: drugs.summary,
  reasonTextMemory: memory.reasonText,
  roles: user.account.roles,
  features: user.account.features,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      select: selectItemToSaveThunk,
      save: saveInterventionThunk,
      reset: clearSavedInterventionStatusThunk,
      updateInterventionData: updateInterventionDataThunk,
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
