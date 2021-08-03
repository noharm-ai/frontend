import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { fetchPrescriptionExamsThunk } from '@store/ducks/prescriptions/thunk';
import ExamModal from '@components/Screening/Exam/ExamModal';

const mapStateToProps = ({ prescriptions }) => ({
  admissionNumber: prescriptions.single.data.admissionNumber,
  idSegment: prescriptions.single.data.idSegment,
  exams: prescriptions.single.exams
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchExams: fetchPrescriptionExamsThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ExamModal);
