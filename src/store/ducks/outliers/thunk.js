import isEmpty from 'lodash.isempty';

import api from '@services/api';
import { errorHandler } from '@utils';
import { transformSegments } from '@utils/transformers';
import { Creators as DrugsCreators } from '../drugs';
import { Creators as SegmentsCreators } from '../segments';
import { Creators as OutliersCreators } from './index';

const {
  outliersGenerateStop,
  outliersResetGenerate,
  outliersGenerateStart,

  outliersFetchListStart,
  outliersFetchListError,
  outliersFetchListSuccess,

  outliersSaveStart,
  outliersSaveSuccess,
  outliersSaveReset,
  outliersSaveError,
} = OutliersCreators;

const { drugsFetchListStart, drugsFetchListError, drugsFetchListSuccess } = DrugsCreators;
const {
  segmentsFetchListStart,
  segmentsFetchListError,
  segmentsFetchListSuccess,
} = SegmentsCreators;

export const generateOutlierThunk = ({ id: idSegment, nameSegment }) => async (
  dispatch,
  getState
) => {
  dispatch(outliersGenerateStart({ idSegment, nameSegment }));

  const { access_token } = getState().auth.identify;
  const { status } = await api.generateOutlier(access_token, idSegment);

  dispatch(outliersGenerateStop(status));
};

export const resetGenerateThunk = () => dispatch => {
  dispatch(outliersResetGenerate());
};

export const fetchOutliersListThunk = (params = {}) => async (dispatch, getState) => {
  dispatch(outliersFetchListStart());
  const { idSegment, idDrug } = params;

  if (!idSegment || !idDrug) {
    dispatch(outliersFetchListError({}));
    return;
  }

  const { access_token } = getState().auth.identify;
  const {
    data: { data },
    error
  } = await api.getOutliersBySegmentAndDrug(access_token, params);

  if (!isEmpty(error)) {
    dispatch(outliersFetchListError(error));
    return;
  }

  const { list: drugs } = getState().drugs;
  const [drug] = drugs.filter(({ idDrug }) => idDrug === params.idDrug);
  const list = data.map(item => ({ ...item, ...drug }));

  dispatch(outliersFetchListSuccess(list, params));
};

export const saveOutlierThunk = (idOutlier, params = {}) => async (dispatch, getState) => {
  if (!idOutlier) {
    return;
  }

  dispatch(outliersSaveStart());
  const { access_token } = getState().auth.identify;
  const { status, error } = await api.putManualScore(access_token, idOutlier, params);

  if (status !== 200) {
    dispatch(outliersSaveError(error));
    return;
  }

  dispatch(outliersSaveSuccess());
  dispatch(outliersSaveReset());
};

export const fetchReferencesListThunk = () => async (dispatch, getState) => {
  dispatch(drugsFetchListStart());
  dispatch(segmentsFetchListStart());
  dispatch(outliersFetchListStart());

  const { access_token } = getState().auth.identify;

  // get drugs list
  const {
    data: drugsData,
    drugsError
  } = await api.getDrugs(access_token).catch(errorHandler);

  if (!isEmpty(drugsError)) {
    dispatch(drugsFetchListError(drugsError));
    return;
  }

  const drugsList = drugsData.data;

  dispatch(drugsFetchListSuccess(drugsList));

  // get segments list
  const { data: segmentsData, segmentsError } = await api.getSegments(access_token).catch(errorHandler);

  if (!isEmpty(segmentsError)) {
    dispatch(segmentsFetchListError(segmentsError));
    return;
  }

  const segmentsList = transformSegments(segmentsData.data);

  dispatch(segmentsFetchListSuccess(segmentsList));

  // get outliers list
  const [drug] = drugsList;
  const [segment] = segmentsList;
  const params = {
    idDrug: drug.idDrug,
    idSegment: segment.id,
  };

  const {
    data: { data },
    error
  } = await api.getOutliersBySegmentAndDrug(access_token, params);

  if (!isEmpty(error)) {
    dispatch(outliersFetchListError(error));
    return;
  }

  const list = data.map(item => ({ ...item, ...drug }));

  dispatch(outliersFetchListSuccess(list, params));
};
