import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { saveSegmentExamThunk, fetchExamTypesListThunk } from '@store/ducks/segments/thunk';

import FormExam from '@components/Forms/Exam';

const mapStateToProps = ({ segments }) => ({
  saveStatus: segments.saveExam,
  examTypes: segments.examTypes
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      save: saveSegmentExamThunk,
      fetchExamTypes: fetchExamTypesListThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(FormExam);
