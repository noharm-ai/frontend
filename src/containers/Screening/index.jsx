import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  saveInterventionThunk,
  clearSavedInterventionStatusThunk
} from '@store/ducks/intervention/thunk';
import {
  fetchScreeningThunk,
  updateInterventionDataThunk,
  fetchPrescriptionExamsThunk
} from '@store/ducks/prescriptions/thunk';
import Screening from '@components/Screening';

const mapStateToProps = ({ prescriptions, auth }) => ({
  error: prescriptions.single.error,
  message: prescriptions.single.message,
  isFetching: prescriptions.single.isFetching,
  content: prescriptions.single.data,
  exams: prescriptions.single.exams,
  access_token: auth.identify.access_token
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchScreeningById: fetchScreeningThunk,
      fetchExams: fetchPrescriptionExamsThunk,
      save: saveInterventionThunk,
      reset: clearSavedInterventionStatusThunk,
      updateInterventionData: updateInterventionDataThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Screening);
