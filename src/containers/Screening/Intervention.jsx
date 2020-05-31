import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  fetchReasonsListThunk,
  updateSelectedItemToSaveInterventionThunk
} from '@store/ducks/intervention/thunk';
import { searchDrugsThunk } from '@store/ducks/drugs/thunk';
import Intervention from '@components/Screening/Intervention';

const mapStateToProps = ({ intervention, drugs }) => ({ intervention, drugs: drugs.search });
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchReasonsList: fetchReasonsListThunk,
      updateSelectedItemToSaveIntervention: updateSelectedItemToSaveInterventionThunk,
      searchDrugs: searchDrugsThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Intervention);
