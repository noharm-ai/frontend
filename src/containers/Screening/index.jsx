import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { fetchClinicalNotesListThunk } from '@store/ducks/clinicalNotes/thunk';
import { fetchScreeningThunk, fetchPrescriptionExamsThunk } from '@store/ducks/prescriptions/thunk';
import Screening from '@components/Screening';

const mapStateToProps = ({ prescriptions }) => ({
  error: prescriptions.single.error,
  message: prescriptions.single.message,
  isFetching: prescriptions.single.isFetching,
  content: prescriptions.single.data,
  exams: prescriptions.single.exams
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchScreeningById: fetchScreeningThunk,
      fetchExams: fetchPrescriptionExamsThunk,
      fetchClinicalNotes: fetchClinicalNotesListThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Screening);
