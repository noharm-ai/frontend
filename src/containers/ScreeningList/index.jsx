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

import FeatureService from "services/features";
import ScreeningList from "components/ScreeningList";

const mapStateToProps = ({
  segments,
  prescriptions,
  app,
  drugs,
  user,
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
  featureService: FeatureService(user.account.features),
  account: user.account,
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
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ScreeningList);
