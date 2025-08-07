import { isEmpty } from "lodash";

import api from "services/api";
import appInfo from "utils/appInfo";
import { errorHandler } from "utils";
import { Creators as SegmentCreators } from "../segments";
import { Creators as UserCreators } from "../user";
import { Creators as AuthCreators } from "./index";
import { Creators as AppCreators } from "../app";
import { resetReduxState } from "../reset";
import {
  setSavedPreferences,
  reset as resetPreferences,
} from "features/preferences/PreferencesSlice";
import { fetchPendingActionTickets } from "src/features/support/SupportSlice";

const { userLogout, userSetLoginStart, userSetCurrentUser } = UserCreators;
const { segmentsFetchListSuccess } = SegmentCreators;
const { authSetErrorIdentify, authDelIdentify } = AuthCreators;
const { appSetData, appSetConfig, appSetCurrentVersion, appSetNotification } =
  AppCreators;

export const oauthLoginThunk = (params) => async (dispatch) => {
  return new Promise(async (resolve, reject) => {
    resetReduxState(dispatch);
    dispatch(userSetLoginStart());

    const { data, error } = await api
      .authenticateOAuth(params)
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(userLogout());
      dispatch(authSetErrorIdentify(error, error.message));
      reject(error);
      return;
    }

    setUser(data.data, true, dispatch);
    resolve(data.data);
  });
};

export const loginThunk =
  ({ keepMeLogged, ...userIndentify }) =>
  async (dispatch) => {
    return new Promise(async (resolve, reject) => {
      resetReduxState(dispatch);
      dispatch(userSetLoginStart());

      const { data, error } = await api
        .authenticate(userIndentify)
        .catch(errorHandler);

      if (!isEmpty(error)) {
        dispatch(userLogout());
        dispatch(authSetErrorIdentify(error, error.message));
        reject(error);
        return;
      }

      setUser(data, keepMeLogged, dispatch);

      resolve(data);
    });
  };

export const logoutThunk = () => {
  return (dispatch) => {
    return new Promise(async (resolve) => {
      localStorage.removeItem("ac1");
      localStorage.removeItem("ac2");

      dispatch(userLogout());
      dispatch(authDelIdentify());

      resolve();
    });
  };
};

export const setUser = (userData, keepMeLogged, dispatch) => {
  const {
    userId,
    userName,
    email,
    schema,
    roles,
    features,
    userFeatures,
    permissions,
    nameUrl,
    multipleNameUrl,
    nameHeaders,
    getnameType,
    apiKey,
    notify,
    proxy,
    segments,
    logoutUrl,
    integrationStatus,
    isCpoe,
    ...identify
  } = userData;
  const user = {
    userId,
    userName,
    email,
    schema,
    roles,
    nameUrl,
    multipleNameUrl,
    proxy,
    nameHeaders,
    getnameType,
    apiKey,
    permissions,
    isCpoe,
  };

  localStorage.setItem("schema", schema);
  if (userData.oauth) {
    localStorage.setItem("oauth", "active");
  } else {
    localStorage.removeItem("oauth");
  }

  localStorage.setItem("maintainer", permissions.includes("MAINTAINER"));

  localStorage.setItem("ac1", identify.access_token.substring(0, 10));
  localStorage.setItem("ac2", identify.access_token.substring(10));

  user.features = [...features, ...userFeatures];
  appInfo.apiKey = apiKey;

  if (userData.preferences) {
    dispatch(setSavedPreferences(userData.preferences));
  } else {
    dispatch(resetPreferences());
  }

  dispatch(segmentsFetchListSuccess(segments));
  dispatch(appSetCurrentVersion(appInfo.version));
  dispatch(userSetCurrentUser(user, keepMeLogged));
  dispatch(
    appSetConfig({
      nameUrl,
      multipleNameUrl,
      apiKey,
      nameHeaders,
      getnameType,
      proxy,
      logoutUrl,
      integrationStatus,
    })
  );
  dispatch(
    appSetData({
      hospitals: userData.hospitals,
    })
  );
  dispatch(appSetNotification(notify));

  // check for pending tickets
  dispatch(fetchPendingActionTickets());
};
