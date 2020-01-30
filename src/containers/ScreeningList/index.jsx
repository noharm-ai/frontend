import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { fetchSegmentsListThunk } from '@store/ducks/segments/thunk';
import { fetchPrescriptionsListThunk } from '@store/ducks/prescriptions/thunk';
import ScreeningList from '@components/ScreeningList';

const mapStateToProps = ({ segments, prescriptions }) => ({
  segments: {
    error: segments.error,
    list: segments.list,
    isFetching: segments.isFetching
  },
  prescriptions: {
    error: prescriptions.error,
    list: prescriptions.list,
    isFetching: prescriptions.isFetching
  }
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchSegmentsList: fetchSegmentsListThunk,
      fetchPrescriptionsList: fetchPrescriptionsListThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ScreeningList);
