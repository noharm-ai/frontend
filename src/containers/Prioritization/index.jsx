import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { setJourneyThunk } from "store/ducks/app/thunk";
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

import Prioritization from "components/Prioritization";
import {
  FILTER_PRIVATE_MEMORY_TYPE,
  FILTER_PUBLIC_MEMORY_TYPE,
} from "utils/memory";
import { TRAINING_SEGMENTS } from "features/training/mock/fixtures/segments";
import { trainingAwareSetScreeningListFilter } from "features/training/TrainingSlice";

const mapStateToProps = ({
  segments,
  prescriptions,
  app,
  drugs,
  user,
  memory,
  training,
}) => ({
  segments: {
    error: segments.error,
    // training never persists into the segments duck (redux-persist would
    // keep fake segments across a mid-training reload) — swap the list here
    // instead, driven by the non-persisted training slice
    list: training.status === "active" ? TRAINING_SEGMENTS : segments.list,
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
  siderCollapsed: app.sider.collapsed,
  // training filter changes (e.g. picking a segment) are sandboxed in the
  // non-persisted training slice and merged in here instead of being
  // dispatched into the real app duck — see trainingAwareSetScreeningListFilter
  filter:
    training.status === "active"
      ? { ...app.filter.screeningList, ...training.filter }
      : app.filter.screeningList,
  drugs: drugs.search,
  frequencies: drugs.frequencies,
  prioritizationType: "cards",
  currentJourney: app.preferences.journey,
  features: user.account.features,
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
      setScreeningListFilter: trainingAwareSetScreeningListFilter,
      searchDrugs: searchDrugsThunk,
      fetchFrequencies: fetchDrugsFrequenciesListThunk,
      setJourney: setJourneyThunk,
      fetchMemory: memoryFetchThunk,
      saveMemory: memorySaveThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Prioritization);
