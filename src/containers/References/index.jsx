import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { fetchDrugsListThunk } from '@store/ducks/drugs/thunk';
import { fetchOutliersListThunk, saveOutlierThunk, fetchReferencesListThunk } from '@store/ducks/outliers/thunk';
import { fetchSegmentsListThunk } from '@store/ducks/segments/thunk';
import References from '@components/References';

const mapStateToProps = ({ drugs, segments, outliers }) => ({
  drugs,
  segments: {
    error: segments.error,
    list: segments.list,
    isFetching: segments.isFetching
  },
  outliers: {
    error: outliers.error,
    list: outliers.list,
    selecteds: outliers.firstFilter,
    isFetching: outliers.isFetching
  }
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      saveOutlier: saveOutlierThunk,
      fetchDrugsList: fetchDrugsListThunk,
      fetchSegmentsList: fetchSegmentsListThunk,
      fetchOutliersList: fetchOutliersListThunk,
      fetchReferencesList: fetchReferencesListThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(References);
