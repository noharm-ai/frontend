import isEmpty from 'lodash.isempty';

import api from '@services/api';
import { errorHandler } from '@utils';
import { Creators as DrugsCreators } from './index';

const {
  drugsFetchListStart,
  drugsFetchListError,
  drugsFetchListSuccess,

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
  unitCoefficientSaveSuccess,
  unitCoefficientSaveError
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

export const saveDrugThunk = (params = {}) => async (dispatch, getState) => {
  dispatch(drugsSaveSingleStart());

  const { access_token } = getState().auth.identify;
  const { status, error } = await api.updateDrug(access_token, params).catch(errorHandler);

  if (status !== 200) {
    dispatch(drugsSaveSingleError(error));
    return;
  }

  dispatch(drugsSaveSingleSuccess());
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

export const saveUnitCoeffiecientThunk = (idDrug, idMeasureUnit, params = {}) => async (
  dispatch,
  getState
) => {
  dispatch(unitCoefficientSaveStart());

  const { access_token } = getState().auth.identify;
  const { status, error } = await api
    .updateUnitCoefficient(access_token, idDrug, idMeasureUnit, params)
    .catch(errorHandler);

  if (status !== 200) {
    dispatch(unitCoefficientSaveError(error));
    return;
  }

  dispatch(unitCoefficientSaveSuccess());
  dispatch(unitCoefficientSaveReset());
};
