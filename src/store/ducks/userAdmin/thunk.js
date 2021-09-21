import isEmpty from 'lodash.isempty';
import arrayMove from 'array-move';

import api from '@services/api';
import { transformSegments, transformSegment } from '@utils/transformers';
import { errorHandler } from '@utils';
import { Creators as UsersCreators } from './index';

const {
  usersFetchListStart,
  usersFetchListError,
  usersFetchListSuccess,

  usersFetchSingleStart,
  usersFetchSingleError,
  usersFetchSingleSuccess,
  usersFetchSingleReset,

  usersSaveSingleStart,
  usersSaveSingleReset,
  usersSaveSingleSuccess,
  usersSaveSingleError,

} = UsersCreators;

export const fetchUsersListThunk = (params = {}) => async (dispatch, getState) => {
  dispatch(usersFetchListStart());

  const { access_token } = getState().auth.identify;

  const { data, error } = await api.getUsers(access_token, params).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(usersFetchListError(error));
    return;
  }

  const list = data.data;

  dispatch(usersFetchListSuccess(list));
};

export const fetchUserByIdThunk = id => async (dispatch, getState) => {
  dispatch(usersFetchSingleStart());

  const { access_token } = getState().auth.identify;
  const { data, error } = await api.getSegmentById(access_token, id).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(usersFetchSingleError(error));
    return;
  }

  const single = transformSegment(data.data);

  dispatch(usersFetchSingleSuccess(single, { idSegment: parseInt(id, 10) }));
};

export const resetSingleUserThunk = () => async (dispatch, getState) => {
  dispatch(usersFetchSingleReset());
};

export const saveUserThunk = (params = {}) => async (dispatch, getState) => {
  dispatch(usersSaveSingleStart());

  const { id } = params;
  const { access_token } = getState().auth.identify;
  const method = id ? 'updateSegment' : 'createSegment';
  const { status, error } = await api[method](access_token, params).catch(errorHandler);

  if (status !== 200) {
    dispatch(usersSaveSingleError(error));
    return;
  }

  dispatch(usersSaveSingleSuccess());
  dispatch(usersSaveSingleReset());
};
