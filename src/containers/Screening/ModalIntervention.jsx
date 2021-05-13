import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  selectItemToSaveThunk,
  saveInterventionThunk,
  clearSavedInterventionStatusThunk,
  fetchReasonsListThunk,
  updateSelectedItemToSaveInterventionThunk
} from '@store/ducks/intervention/thunk';
import {
  updateInterventionDataThunk,
  checkInterventionThunk,
  checkPrescriptionDrugThunk
} from '@store/ducks/prescriptions/thunk';
import { searchDrugsThunk } from '@store/ducks/drugs/thunk';
import { memoryFetchReasonTextThunk, memorySaveReasonTextThunk } from '@store/ducks/memory/thunk';
import Intervention from '@components/Forms/Intervention';

const mapStateToProps = ({ intervention, drugs, memory }) => ({
  intervention: intervention.maybeCreateOrUpdate,
  reasons: intervention.reasons,
  drugs: drugs.search,
  reasonTextMemory: memory.reasonText
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      select: selectItemToSaveThunk,
      save: saveInterventionThunk,
      reset: clearSavedInterventionStatusThunk,
      updateInterventionData: updateInterventionDataThunk,
      saveInterventionStatus: checkInterventionThunk,
      savePrescriptionDrugStatus: checkPrescriptionDrugThunk,
      fetchReasonsList: fetchReasonsListThunk,
      updateSelectedItemToSaveIntervention: updateSelectedItemToSaveInterventionThunk,
      searchDrugs: searchDrugsThunk,
      memorySaveReasonText: memorySaveReasonTextThunk,
      memoryFetchReasonText: memoryFetchReasonTextThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Intervention);
