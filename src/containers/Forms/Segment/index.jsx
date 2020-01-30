import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { saveSegmentThunk } from '@store/ducks/segments/thunk';
import { fetchDepartmentsListThunk } from '@store/ducks/departments/thunk';
import FormSegment from '@components/Forms/Segment';

const mapStateToProps = ({ departments, segments }) => ({
  saveStatus: segments.save,
  departments: {
    error: departments.error,
    list: departments.list,
    isFetching: departments.isFetching
  }
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      saveSegment: saveSegmentThunk,
      fetchDepartments: fetchDepartmentsListThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(FormSegment);
