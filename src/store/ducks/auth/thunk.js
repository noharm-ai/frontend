import isEmpty from 'lodash.isempty';

import api from '@services/api';
import { errorHandler } from '@utils';
import { Creators as UserCreators } from '../user';
import { Creators as SessionCreators } from '../session';
import { Creators as AuthCreators } from './index';
import { Creators as AppCreators } from '../app';

const { sessionSetFirstAccess } = SessionCreators;
const { userLogout, userSetLoginStart, userSetCurrentUser } = UserCreators;
const { authSetErrorIdentify, authSetIdentify, authDelIdentify } = AuthCreators;
const { appSetConfig } = AppCreators;

export const loginThunk = ({ keepMeLogged, ...userIndentify }) => async dispatch => {
  dispatch(userSetLoginStart());

  const { data, error } = await api.authenticate(userIndentify).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(userLogout());
    dispatch(authSetErrorIdentify(error, error.message));
    return;
  }

  const { userName, email, schema, roles, nameUrl, ...identify } = data;
  const user = {
    userName,
    email,
    schema,
    roles
  };

  dispatch(authSetIdentify(identify));
  dispatch(sessionSetFirstAccess());
  dispatch(userSetCurrentUser(user, keepMeLogged));
  dispatch(appSetConfig({ nameUrl }));
};

export const logoutThunk = () => {
  return dispatch => {
    dispatch(userLogout());
    dispatch(authDelIdentify());
  };
};
