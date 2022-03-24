import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { patientCentralFetchListThunk } from '@store/ducks/patientCentral/thunk';
import {
  fetchSegmentsListThunk,
  fetchSegmentByIdThunk,
  resetSingleSegmentThunk
} from '@store/ducks/segments/thunk';

import Filter from '@components/PatientList/Filter';

const mapStateToProps = ({ patientCentral, segments }) => ({
  error: patientCentral.error,
  isFetching: patientCentral.isFetching,
  segments: {
    error: segments.error,
    list: segments.list,
    isFetching: segments.isFetching,
    single: segments.single
  }
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchList: patientCentralFetchListThunk,
      fetchDepartmentsList: fetchSegmentByIdThunk,
      resetDepartmentsList: resetSingleSegmentThunk,
      fetchSegmentsList: fetchSegmentsListThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Filter);
