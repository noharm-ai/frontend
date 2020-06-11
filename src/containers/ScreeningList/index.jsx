import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  setScreeningListFilterThunk,
  saveFilterThunk,
  removeFilterThunk
} from '@store/ducks/app/thunk';
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
import { searchDrugsThunk } from '@store/ducks/drugs/thunk';
import ScreeningList from '@components/ScreeningList';

const mapStateToProps = ({ segments, prescriptions, app, drugs }) => ({
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
  },
  filter: app.filter.screeningList,
  savedFilters: app.savedFilters.screeningList,
  drugs: drugs.search
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchDepartmentsList: fetchSegmentByIdThunk,
      resetDepartmentsLst: resetSingleSegmentThunk,
      fetchSegmentsList: fetchSegmentsListThunk,
      fetchPrescriptionsList: fetchPrescriptionsListThunk,
      checkScreening: checkScreeningThunk,
      updatePrescriptionListStatus: updatePrescriptionStatusThunk,
      setScreeningListFilter: setScreeningListFilterThunk,
      saveFilter: saveFilterThunk,
      removeFilter: removeFilterThunk,
      searchDrugs: searchDrugsThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ScreeningList);
