import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  fetchSegmentsListThunk,
  fetchSegmentByIdThunk,
  resetSingleSegmentThunk
} from '@store/ducks/segments/thunk';
import {
  fetchPrescriptionsListThunk,
  checkScreeningThunk,
  updatePrescriptionStatusThunk
} from '@store/ducks/prescriptions/thunk';
import ScreeningList from '@components/ScreeningList';

const mapStateToProps = ({ segments, prescriptions }) => ({
  segments: {
    error: segments.error,
    list: segments.list,
    isFetching: segments.isFetching,
    single: segments.single
  },
  prescriptions: {
    error: prescriptions.error,
    list: prescriptions.list,
    isFetching: prescriptions.isFetching,
    check: {
      ...prescriptions.single.check
    }
  }
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchDepartmentsList: fetchSegmentByIdThunk,
      resetDepartmentsLst: resetSingleSegmentThunk,
      fetchSegmentsList: fetchSegmentsListThunk,
      fetchPrescriptionsList: fetchPrescriptionsListThunk,
      checkScreening: checkScreeningThunk,
      updatePrescriptionListStatus: updatePrescriptionStatusThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ScreeningList);
