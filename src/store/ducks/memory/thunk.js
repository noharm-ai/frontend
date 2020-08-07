import isEmpty from 'lodash.isempty';

import api from '@services/api';
import { errorHandler } from '@utils';
import { Creators as ReportsCreators } from './index';

const {
  memoryFetchReasonTextStart,
  memoryFetchReasonTextError,
  memoryFetchReasonTextSuccess,

  memorySaveReasonTextStart,
  memorySaveReasonTextError,
  memorySaveReasonTextSuccess,
  memorySaveReasonTextReset
} = ReportsCreators;

export const memoryFetchReasonTextThunk = type => async (dispatch, getState) => {
  dispatch(memoryFetchReasonTextStart());

  const { access_token } = getState().auth.identify;

  const { data, error } = await api.getMemory(access_token, type).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(memoryFetchReasonTextError(error));
    return;
  }

  dispatch(memoryFetchReasonTextSuccess(data.data));
};

export const memorySaveReasonTextThunk = params => async (dispatch, getState) => {
  dispatch(memorySaveReasonTextStart());

  const { access_token } = getState().auth.identify;

  const { data, error } = await api.putMemory(access_token, params).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(memorySaveReasonTextError(error));
    return;
  }

  dispatch(memorySaveReasonTextSuccess({ ...params, key: data.data }));
  dispatch(memorySaveReasonTextReset());
};
