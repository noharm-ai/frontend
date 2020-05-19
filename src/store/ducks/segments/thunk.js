import isEmpty from 'lodash.isempty';

import api from '@services/api';
import { errorHandler } from '@utils';
import { transformSegments, transformSegment } from '@utils/transformers';
import { Creators as SegmentsCreators } from './index';

const {
  segmentsFetchListStart,
  segmentsFetchListError,
  segmentsFetchListSuccess,

  segmentsFetchSingleStart,
  segmentsFetchSingleError,
  segmentsFetchSingleSuccess,
  segmentsFetchSingleReset,

  segmentsSaveSingleStart,
  segmentsSaveSingleReset,
  segmentsSaveSingleSuccess,
  segmentsSaveSingleError
} = SegmentsCreators;

export const fetchSegmentsListThunk = (params = {}) => async (dispatch, getState) => {
  dispatch(segmentsFetchListStart());

  const { access_token } = getState().auth.identify;

  const { data, error } = await api.getSegments(access_token, params).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(segmentsFetchListError(error));
    return;
  }

  const list = transformSegments(data.data);

  dispatch(segmentsFetchListSuccess(list));
};

export const fetchSegmentByIdThunk = id => async (dispatch, getState) => {
  dispatch(segmentsFetchSingleStart());

  const { access_token } = getState().auth.identify;
  const { data, error } = await api.getSegmentById(access_token, id).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(segmentsFetchSingleError(error));
    return;
  }

  const single = transformSegment(data.data);

  dispatch(segmentsFetchSingleSuccess(single));
};

export const resetSingleSegmentThunk = () => async (dispatch, getState) => {
  dispatch(segmentsFetchSingleReset());
};

export const saveSegmentThunk = (params = {}) => async (dispatch, getState) => {
  dispatch(segmentsSaveSingleStart());

  const { id } = params;
  const { access_token } = getState().auth.identify;
  const method = id ? 'updateSegment' : 'createSegment';
  const { status, error } = await api[method](access_token, params).catch(errorHandler);

  if (status !== 200) {
    dispatch(segmentsSaveSingleError(error));
    return;
  }

  dispatch(segmentsSaveSingleSuccess());
  dispatch(segmentsSaveSingleReset());
};
