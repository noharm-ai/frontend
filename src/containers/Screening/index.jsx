import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  selectItemToSaveThunk,
  saveInterventionThunk,
  clearSavedInterventionStatusThunk
} from '@store/ducks/intervention/thunk';
import { fetchScreeningThunk, fetchPrescriptionByIdThunk } from '@store/ducks/prescriptions/thunk';
import Screening from '@components/Screening';

const mapStateToProps = ({ prescriptions, segments, intervention }) => ({
  prescription: {
    error: prescriptions.single.error,
    message: prescriptions.single.message,
    isFetching: prescriptions.single.isFetching,
    content: prescriptions.single.data
  },
  segment: {
    ...segments.single
  },
  maybeCreateOrUpdate: {
    ...intervention.maybeCreateOrUpdate
  }
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchPrescriptionById: fetchPrescriptionByIdThunk,
      fetchScreeningById: fetchScreeningThunk,
      select: selectItemToSaveThunk,
      save: saveInterventionThunk,
      reset: clearSavedInterventionStatusThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Screening);
