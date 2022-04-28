import isEmpty from 'lodash.isempty';

import api from '@services/api';
import appInfo from '@utils/appInfo';
import { errorHandler } from '@utils';
import { Creators as UserCreators } from '../user';
import { Creators as SessionCreators } from '../session';
import { Creators as AuthCreators } from './index';
import { Creators as AppCreators } from '../app';

const { sessionSetFirstAccess } = SessionCreators;
const { userLogout, userSetLoginStart, userSetCurrentUser } = UserCreators;
const { authSetErrorIdentify, authSetIdentify, authDelIdentify } = AuthCreators;
const { appSetConfig, appSetCurrentVersion, appSetNotification } = AppCreators;

export const loginThunk = ({ keepMeLogged, ...userIndentify }) => async dispatch => {
  dispatch(userSetLoginStart());

  const { data, error } = await api.authenticate(userIndentify).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(userLogout());
    dispatch(authSetErrorIdentify(error, error.message));
    return;
  }

  const {
    userId,
    userName,
    email,
    schema,
    roles,
    features,
    nameUrl,
    nameHeaders,
    apiKey,
    notify,
    ...identify
  } = data;
  const user = {
    userId,
    userName,
    email,
    schema,
    roles,
    features,
    nameUrl,
    nameHeaders,
    apiKey
  };

  appInfo.apiKey = apiKey;

  dispatch(authSetIdentify(identify));
  dispatch(sessionSetFirstAccess());
  dispatch(appSetCurrentVersion(appInfo.version));
  dispatch(userSetCurrentUser(user, keepMeLogged));
  dispatch(appSetConfig({ nameUrl, apiKey, nameHeaders }));
  dispatch(appSetNotification(notify));
};

export const logoutThunk = () => {
  return dispatch => {
    dispatch(userLogout());
    dispatch(authDelIdentify());
  };
};
