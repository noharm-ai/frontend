import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { setScreeningListFilterThunk, setJourneyThunk } from '@store/ducks/app/thunk';
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
import { memoryFetchThunk, memorySaveThunk } from '@store/ducks/memory/thunk';

import security from '@services/security';
import ScreeningList from '@components/ScreeningList';
import { FILTER_PRIVATE_MEMORY_TYPE, FILTER_PUBLIC_MEMORY_TYPE } from '@utils/memory';

const mapStateToProps = ({ segments, prescriptions, app, drugs, user, memory }) => ({
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
  security: security(user.account.roles),
  account: user.account,
  privateFilters: memory[FILTER_PRIVATE_MEMORY_TYPE] ? memory[FILTER_PRIVATE_MEMORY_TYPE].list : [],
  publicFilters: memory[FILTER_PUBLIC_MEMORY_TYPE] ? memory[FILTER_PUBLIC_MEMORY_TYPE].list : []
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
      searchDrugs: searchDrugsThunk,
      setJourney: setJourneyThunk,
      fetchMemory: memoryFetchThunk,
      saveMemory: memorySaveThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ScreeningList);
