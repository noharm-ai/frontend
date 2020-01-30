import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { fetchSegmentByIdThunk } from '@store/ducks/segments/thunk';
import EditSegment from '@components/EditSegment';

const mapStateToProps = ({ segments }) => ({
  segment: {
    ...segments.single
  }
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchSegmentById: fetchSegmentByIdThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(EditSegment);
