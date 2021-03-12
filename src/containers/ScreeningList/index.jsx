import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  setScreeningListFilterThunk,
  saveFilterThunk,
  removeFilterThunk,
  setJourneyThunk
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
import security from '@services/security';
import ScreeningList from '@components/ScreeningList';

const mapStateToProps = ({ segments, prescriptions, app, drugs, user }) => ({
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
  drugs: drugs.search,
  currentJourney: app.preferences.journey,
  security: security(user.account.roles)
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
      searchDrugs: searchDrugsThunk,
      setJourney: setJourneyThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ScreeningList);
