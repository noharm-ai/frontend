import { Creators as AppCreators } from "./index";

const {
  appSetSider,
  appSetScreeningListFilter,
  appSetConfig,
  appSetJourney,
  appSetNotification,
} = AppCreators;

export const setSiderThunk =
  (state = {}) =>
  (dispatch) => {
    dispatch(appSetSider(state));
  };

export const setJourneyThunk = (journey) => (dispatch) => {
  dispatch(appSetJourney(journey));
};

export const setConfigThunk =
  (config = {}) =>
  (dispatch) => {
    dispatch(appSetConfig(config));
  };

export const setScreeningListFilterThunk =
  (params = {}) =>
  (dispatch) => {
    dispatch(appSetScreeningListFilter(params));
  };

export const setNotificationThunk = (notification) => (dispatch) => {
  dispatch(appSetNotification(notification));
};
