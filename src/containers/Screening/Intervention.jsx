import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  fetchReasonsListThunk,
  updateSelectedItemToSaveInterventionThunk
} from '@store/ducks/intervention/thunk';
import Intervention from '@components/Screening/Intervention';

const mapStateToProps = ({ intervention }) => ({ intervention });
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchReasonsList: fetchReasonsListThunk,
      updateSelectedItemToSaveIntervention: updateSelectedItemToSaveInterventionThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Intervention);
