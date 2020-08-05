import isEmpty from 'lodash.isempty';

import api from '@services/api';
import { errorHandler } from '@utils';
import { Creators as UserCreators } from '../user';
import { Creators as SessionCreators } from '../session';
import { Creators as AuthCreators } from './index';

const { sessionSetFirstAccess } = SessionCreators;
const { userLogout, userSetLoginStart, userSetCurrentUser } = UserCreators;
const { authSetErrorIdentify, authSetIdentify, authDelIdentify } = AuthCreators;

export const loginThunk = ({ keepMeLogged, ...userIndentify }) => async dispatch => {
  dispatch(userSetLoginStart());

  const { data, error } = await api.authenticate(userIndentify).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(userLogout());
    dispatch(authSetErrorIdentify(error, error.message));
    return;
  }

  const { userName, schema, roles, ...identify } = data;
  const user = {
    userName,
    schema,
    roles
  };

  dispatch(authSetIdentify(identify));
  dispatch(sessionSetFirstAccess());
  dispatch(userSetCurrentUser(user, keepMeLogged));
};

export const logoutThunk = () => {
  return dispatch => {
    dispatch(userLogout());
    dispatch(authDelIdentify());
  };
};
