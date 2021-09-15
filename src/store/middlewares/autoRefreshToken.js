import isEmpty from 'lodash.isempty';
import { toDate, isPast } from 'date-fns';

import api from '@services/api';
import { tokenDecode } from '@utils';

import { Creators as AuthCreators } from '../ducks/auth';

const { authSetIdentify } = AuthCreators;

const autoRefreshToken = ({ dispatch, getState }) => next => async action => {
  if (typeof action !== 'function') {
    return next(action);
  }

  const { auth } = getState();

  if (!isEmpty(auth) && !isEmpty(auth.identify)) {
    const { access_token, refresh_token } = auth.identify;
    const { exp } = tokenDecode(access_token);
    const expireDate = toDate(exp * 1000);
    const errorHandler = e => {
      return {
        error: e.response ? e.response.data : 'error',
        status: e.response ? e.response.status : e.code,
        data: {}
      };
    };

    if (!isPast(expireDate)) {
      return next(action);
    }

    const { data: identify } = await api.refreshToken(refresh_token).catch(errorHandler);

    dispatch(authSetIdentify(identify));

    return next(action);
  }
  return next(action);
};

export default autoRefreshToken;
