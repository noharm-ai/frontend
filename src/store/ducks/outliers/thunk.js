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

  outliersGenerateDrugStart,
  outliersGenerateDrugError,
  outliersGenerateDrugSuccess,
  outliersGenerateDrugReset,

  outliersFetchListStart,
  outliersFetchListError,
  outliersFetchListSuccess,

  outliersSaveStart,
  outliersSaveSuccess,
  outliersSaveReset,
  outliersSaveError,

  outliersSetSelectedItem,
  outliersUpdateSelectedItem
} = OutliersCreators;

const { drugsFetchListStart, drugsFetchListError, drugsFetchListSuccess } = DrugsCreators;
const {
  segmentsFetchListStart,
  segmentsFetchListError,
  segmentsFetchListSuccess
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

export const generateDrugOutlierThunk = ({ idSegment, idDrug }) => async (dispatch, getState) => {
  dispatch(outliersGenerateDrugStart());

  const { access_token } = getState().auth.identify;
  const {
    data: { data },
    error
  } = await api.generateDrugOutlier(access_token, { idSegment, idDrug }).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(outliersGenerateDrugError(error));
    return;
  }

  dispatch(outliersGenerateDrugSuccess(data));
};

export const resetGenerateThunk = () => dispatch => {
  dispatch(outliersResetGenerate());
};

export const resetGenerateDrugOutlierThunk = () => dispatch => {
  dispatch(outliersGenerateDrugReset());
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
  const { status, error } = await api.updateOutlier(access_token, idOutlier, params);

  if (status !== 200) {
    dispatch(outliersSaveError(error));
    return;
  }

  dispatch(outliersSaveSuccess(idOutlier, params));
  dispatch(outliersSaveReset());
};

export const fetchReferencesListThunk = (idSegment, idDrug, dose, frequency) => async (
  dispatch,
  getState
) => {
  dispatch(drugsFetchListStart());
  dispatch(segmentsFetchListStart());
  dispatch(outliersFetchListStart());

  const { access_token } = getState().auth.identify;

  // get drugs list
  if (idSegment == null) {
    idSegment = 1;
  }
  const { data: drugsData, drugsError } = await api
    .getDrugsBySegment(access_token, idSegment)
    .catch(errorHandler);

  if (!isEmpty(drugsError)) {
    dispatch(drugsFetchListError(drugsError));
    return;
  }

  const drugsList = drugsData.data;

  dispatch(drugsFetchListSuccess(drugsList));

  // get segments list
  const { data: segmentsData, segmentsError } = await api
    .getSegments(access_token)
    .catch(errorHandler);

  if (!isEmpty(segmentsError)) {
    dispatch(segmentsFetchListError(segmentsError));
    return;
  }

  const segmentsList = transformSegments(segmentsData.data);

  dispatch(segmentsFetchListSuccess(segmentsList));

  // get outliers list
  let drug;
  let params;

  if (idDrug != null) {
    params = {
      idDrug: parseInt(idDrug, 10),
      idSegment: parseInt(idSegment, 10)
    };
    drug = drugsList.find(item => item.idDrug === params.idDrug);
  } else {
    const [segment] = segmentsList;
    drug = drugsList[0];

    params = {
      idDrug: drug.idDrug,
      idSegment: segment.id
    };
  }

  if (dose != null && frequency != null) {
    params.d = dose;
    params.f = frequency;
  }

  const {
    data: { data },
    error
  } = await api.getOutliersBySegmentAndDrug(access_token, params);

  if (!isEmpty(error)) {
    dispatch(outliersFetchListError(error));
    return;
  }

  const { outliers } = data;
  const list = outliers.map(item => ({
    ...item,
    ...drug,
    ...data
  }));
  const drugData = data;
  delete drugData.outliers;

  dispatch(outliersFetchListSuccess(list, drugData, params));
};

export const selectItemToSaveThunk = item => dispatch => {
  dispatch(outliersSetSelectedItem(item));
};

export const updateSelectedItemToSaveOutlierThunk = item => dispatch => {
  dispatch(outliersUpdateSelectedItem(item));
};
