import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  fetchReasonsListThunk,
  updateSelectedItemToSaveInterventionThunk
} from '@store/ducks/intervention/thunk';
import { searchDrugsThunk } from '@store/ducks/drugs/thunk';
import { memoryFetchReasonTextThunk, memorySaveReasonTextThunk } from '@store/ducks/memory/thunk';

import Intervention from '@components/Screening/Intervention';

const mapStateToProps = ({ intervention, drugs, memory }) => ({
  intervention,
  drugs: drugs.search,
  reasonTextMemory: memory.reasonText
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchReasonsList: fetchReasonsListThunk,
      updateSelectedItemToSaveIntervention: updateSelectedItemToSaveInterventionThunk,
      searchDrugs: searchDrugsThunk,
      memorySaveReasonText: memorySaveReasonTextThunk,
      memoryFetchReasonText: memoryFetchReasonTextThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Intervention);
