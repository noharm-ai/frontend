import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  fetchDrugsListThunk,
  fetchDrugsUnitsListThunk,
  saveUnitCoeffiecientThunk
} from '@store/ducks/drugs/thunk';
import {
  fetchOutliersListThunk,
  saveOutlierThunk,
  fetchReferencesListThunk,
  selectItemToSaveThunk
} from '@store/ducks/outliers/thunk';
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
    isFetching: outliers.isFetching,
    edit: outliers.edit,
    saveStatus: outliers.save
  }
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      selectOutlier: selectItemToSaveThunk,
      saveOutlier: saveOutlierThunk,
      saveUnitCoefficient: saveUnitCoeffiecientThunk,
      fetchDrugsList: fetchDrugsListThunk,
      fetchDrugsUnitsList: fetchDrugsUnitsListThunk,
      fetchSegmentsList: fetchSegmentsListThunk,
      fetchOutliersList: fetchOutliersListThunk,
      fetchReferencesList: fetchReferencesListThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(References);
