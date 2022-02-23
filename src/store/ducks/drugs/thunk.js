import isEmpty from 'lodash.isempty';

import api from '@services/api';
import { errorHandler } from '@utils';
import { Creators as DrugsCreators } from './index';

const {
  drugsFetchListStart,
  drugsFetchListError,
  drugsFetchListSuccess,

  drugsFetchSummaryStart,
  drugsFetchSummaryError,
  drugsFetchSummarySuccess,

  drugsSearchStart,
  drugsSearchError,
  drugsSearchSuccess,

  drugsUnitsFetchListStart,
  drugsUnitsFetchListError,
  drugsUnitsFetchListSuccess,

  drugsSaveSingleStart,
  drugsSaveSingleReset,
  drugsSaveSingleSuccess,
  drugsSaveSingleError,

  unitCoefficientSaveStart,
  unitCoefficientSaveReset,
  unitCoefficientSaveSuccess
} = DrugsCreators;

export const fetchDrugsListThunk = (params = {}) => async (dispatch, getState) => {
  dispatch(drugsFetchListStart());

  const { access_token } = getState().auth.identify;
  const { data, error } = await api.getDrugs(access_token, params).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(drugsFetchListError(error));
    return;
  }

  const list = data.data;

  dispatch(drugsFetchListSuccess(list));
};

export const searchDrugsThunk = (idSegment, params = {}) => async (dispatch, getState) => {
  dispatch(drugsSearchStart());

  const { access_token } = getState().auth.identify;
  const { data, error } = await api
    .getDrugsBySegment(access_token, idSegment, params)
    .catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(drugsSearchError(error));
    return;
  }

  const list = data.data;

  dispatch(drugsSearchSuccess(list));
};

export const saveDrugThunk = ({ formId, ...params }) => async (dispatch, getState) => {
  dispatch(drugsSaveSingleStart());

  const { access_token } = getState().auth.identify;
  const { status, error } = await api.updateDrug(access_token, params).catch(errorHandler);

  if (status !== 200) {
    dispatch(drugsSaveSingleError(error));
    return;
  }

  dispatch(drugsSaveSingleSuccess(formId));
  dispatch(drugsSaveSingleReset());
};

export const fetchDrugsUnitsListThunk = (params = {}) => async (dispatch, getState) => {
  dispatch(drugsUnitsFetchListStart());

  const { access_token } = getState().auth.identify;
  const { data, error } = await api.getDrugUnits(access_token, params).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(drugsUnitsFetchListError(error));
    return;
  }

  const list = data.data;

  dispatch(drugsUnitsFetchListSuccess(list));
};

export const saveUnitCoeffiecientThunk = (idMeasureUnit, params = {}) => async dispatch => {
  dispatch(unitCoefficientSaveStart());
  dispatch(unitCoefficientSaveSuccess(idMeasureUnit, params));
  dispatch(unitCoefficientSaveReset());
};

export const fetchDrugSummaryThunk = (idDrug, idSegment) => async (dispatch, getState) => {
  dispatch(drugsFetchSummaryStart());

  const { access_token } = getState().auth.identify;
  const { data, error } = await api
    .getDrugSummary(access_token, idDrug, idSegment)
    .catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(drugsFetchSummaryError(error));
    return;
  }

  dispatch(drugsFetchSummarySuccess(data.data));
};

export const fetchDrugResourcesThunk = (idDrug, idSegment, idHospital) => async (
  dispatch,
  getState
) => {
  dispatch(drugsFetchSummaryStart());

  const { access_token } = getState().auth.identify;
  const { data, error } = await api
    .getDrugResources(access_token, idDrug, idSegment, idHospital)
    .catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(drugsFetchSummaryError(error));
    return;
  }

  dispatch(drugsFetchSummarySuccess(data.data));
};
