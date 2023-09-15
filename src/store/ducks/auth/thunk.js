import isEmpty from "lodash.isempty";

import api from "services/api";
import appInfo from "utils/appInfo";
import { errorHandler } from "utils";
import { Creators as SegmentCreators } from "../segments";
import { Creators as UserCreators } from "../user";
import { Creators as SessionCreators } from "../session";
import { Creators as AuthCreators } from "./index";
import { Creators as AppCreators } from "../app";

const { sessionSetFirstAccess } = SessionCreators;
const { userLogout, userSetLoginStart, userSetCurrentUser } = UserCreators;
const { segmentsFetchListSuccess } = SegmentCreators;
const { authSetErrorIdentify, authSetIdentify, authDelIdentify } = AuthCreators;
const { appSetData, appSetConfig, appSetCurrentVersion, appSetNotification } =
  AppCreators;

export const oauthLoginThunk = (params) => async (dispatch) => {
  dispatch(userSetLoginStart());

  const { data, error } = await api
    .authenticateOAuth(params)
    .catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(userLogout());
    dispatch(authSetErrorIdentify(error, error.message));
    return;
  }

  setUser(data.data, true, dispatch);
};

export const loginThunk =
  ({ keepMeLogged, ...userIndentify }) =>
  async (dispatch) => {
    dispatch(userSetLoginStart());

    const { data, error } = await api
      .authenticate(userIndentify)
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(userLogout());
      dispatch(authSetErrorIdentify(error, error.message));
      return;
    }

    setUser(data, keepMeLogged, dispatch);
  };

export const logoutThunk = () => {
  return (dispatch) => {
    localStorage.removeItem("ac1");
    localStorage.removeItem("ac2");

    dispatch(userLogout());
    dispatch(authDelIdentify());
  };
};

const setUser = (userData, keepMeLogged, dispatch) => {
  const {
    userId,
    userName,
    email,
    schema,
    roles,
    features,
    userFeatures,
    nameUrl,
    multipleNameUrl,
    nameHeaders,
    apiKey,
    notify,
    proxy,
    segments,
    logoutUrl,
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
    apiKey,
  };

  localStorage.setItem("ac1", identify.access_token.substring(0, 10));
  localStorage.setItem("ac2", identify.access_token.substring(10));

  user.features = [...features, ...userFeatures];
  appInfo.apiKey = apiKey;

  dispatch(segmentsFetchListSuccess(segments));
  dispatch(authSetIdentify(identify));
  dispatch(sessionSetFirstAccess());
  dispatch(appSetCurrentVersion(appInfo.version));
  dispatch(userSetCurrentUser(user, keepMeLogged));
  dispatch(
    appSetConfig({
      nameUrl,
      multipleNameUrl,
      apiKey,
      nameHeaders,
      proxy,
      logoutUrl,
    })
  );
  dispatch(
    appSetData({
      hospitals: userData.hospitals,
    })
  );
  dispatch(appSetNotification(notify));
};
