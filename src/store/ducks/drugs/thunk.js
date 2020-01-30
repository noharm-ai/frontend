import isEmpty from 'lodash.isempty';

import api from '@services/api';
import { errorHandler } from '@utils';
import { Creators as DrugsCreators } from './index';

const { drugsFetchListStart, drugsFetchListError, drugsFetchListSuccess } = DrugsCreators;

export const fetchDrugsListThunk = (params = {}) => async (dispatch, getState) => {
  dispatch(drugsFetchListStart());

  const { access_token } = getState().auth.identify;
  const {
    data,
    error
  } = await api.getDrugs(access_token, params).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(drugsFetchListError(error));
    return;
  }

  const list = data.data;

  dispatch(drugsFetchListSuccess(list));
};
