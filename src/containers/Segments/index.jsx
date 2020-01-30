import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { generateOutlierThunk, resetGenerateThunk } from '@store/ducks/outliers/thunk';
import { fetchSegmentsListThunk } from '@store/ducks/segments/thunk';
import Segments from '@components/Segments';

const mapStateToProps = ({ segments, outliers }) => ({
  segments: {
    error: segments.error,
    list: segments.list,
    isFetching: segments.isFetching
  },
  outliers: {
    generate: {
      ...outliers.generate
    }
  }
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      resetGenerate: resetGenerateThunk,
      generateOutlier: generateOutlierThunk,
      fetchSegmentsList: fetchSegmentsListThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Segments);
