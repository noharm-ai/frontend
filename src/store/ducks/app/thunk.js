import { isEmpty } from "lodash";

import { Creators as AppCreators } from "./index";
import {
  TrackedPrescriptionPrioritizationAction,
  trackPrescriptionPrioritizationAction,
} from "src/utils/tracker";

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

    Object.keys(params).forEach((k) => {
      if (
        params[k] !== null &&
        params[k] !== undefined &&
        params[k] !== "" &&
        params[k]?.length !== 0
      ) {
        trackPrescriptionPrioritizationAction(
          TrackedPrescriptionPrioritizationAction.USE_FILTER,
          { title: k }
        );
      }
    });
  };

export const setNotificationThunk = (notification) => (dispatch) => {
  dispatch(appSetNotification(notification));
};
