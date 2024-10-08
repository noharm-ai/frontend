import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
  setScreeningListFilterThunk,
  setJourneyThunk,
} from "store/ducks/app/thunk";
import {
  fetchPrescriptionsListThunk,
  checkScreeningThunk,
  updatePrescriptionStatusThunk,
} from "store/ducks/prescriptions/thunk";
import {
  searchDrugsThunk,
  fetchDrugsFrequenciesListThunk,
} from "store/ducks/drugs/thunk";
import { memoryFetchThunk, memorySaveThunk } from "store/ducks/memory/thunk";

import security from "services/security";
import FeatureService from "services/features";
import ScreeningList from "components/ScreeningList";
import {
  FILTER_PRIVATE_MEMORY_TYPE,
  FILTER_PUBLIC_MEMORY_TYPE,
} from "utils/memory";

const mapStateToProps = ({
  segments,
  prescriptions,
  app,
  drugs,
  user,
  memory,
}) => ({
  segments: {
    error: segments.error,
    list: segments.list,
    isFetching: segments.isFetching,
    single: segments.single,
  },
  prescriptions: {
    error: prescriptions.error,
    list: prescriptions.list,
    isFetching: prescriptions.isFetching,
    check: {
      ...prescriptions.single.check,
    },
  },
  filter: app.filter.screeningList,
  drugs: drugs.search,
  frequencies: drugs.frequencies,
  currentJourney: app.preferences.journey,
  security: security(user.account.roles),
  featureService: FeatureService(user.account.features),
  account: user.account,
  privateFilters: memory[FILTER_PRIVATE_MEMORY_TYPE]
    ? memory[FILTER_PRIVATE_MEMORY_TYPE].list
    : [],
  publicFilters: memory[FILTER_PUBLIC_MEMORY_TYPE]
    ? memory[FILTER_PUBLIC_MEMORY_TYPE].list
    : [],
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPrescriptionsList: fetchPrescriptionsListThunk,
      checkScreening: checkScreeningThunk,
      updatePrescriptionListStatus: updatePrescriptionStatusThunk,
      setScreeningListFilter: setScreeningListFilterThunk,
      searchDrugs: searchDrugsThunk,
      fetchFrequencies: fetchDrugsFrequenciesListThunk,
      setJourney: setJourneyThunk,
      fetchMemory: memoryFetchThunk,
      saveMemory: memorySaveThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ScreeningList);
