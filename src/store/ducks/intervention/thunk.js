import isEmpty from 'lodash.isempty';

import api from '@services/api';
import { errorHandler } from '@utils';
import { Creators as InterventionCreators } from './index';

const {
  interventionFetchListStart,
  interventionFetchListError,
  interventionFetchListSuccess,

  interventionFetchReasonsListStart,
  interventionFetchReasonsListError,
  interventionFetchReasonsListSuccess,

  interventionSetSelectedItem,
  interventionUpdateSelectedItemIntervention,

  interventionSetSaveStart,
  interventionSetSaveError,
  interventionSetSaveSuccess,
  interventionClearSavedStatus,

  interventionCheckStart,
  interventionCheckError,
  interventionCheckSuccess,

  interventionUpdateList,

  interventionFetchFuturePrescriptionStart,
  interventionFetchFuturePrescriptionError,
  interventionFetchFuturePrescriptionSuccess
} = InterventionCreators;

export const fetchListThunk = (params = {}) => async (dispatch, getState) => {
  dispatch(interventionFetchListStart());

  const { access_token } = getState().auth.identify;
  const {
    data: { data },
    error
  } = await api.getInterventions(access_token, params).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(interventionFetchListError(error));
    return;
  }

  const list = data;

  dispatch(interventionFetchListSuccess(list));
};

export const fetchReasonsListThunk = (params = {}) => async (dispatch, getState) => {
  if (!isEmpty(getState().intervention.reasons.list)) {
    return;
  }
  dispatch(interventionFetchReasonsListStart());

  const { access_token } = getState().auth.identify;
  const {
    data: { data },
    error
  } = await api.getInterventionReasons(access_token, params).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(interventionFetchReasonsListError(error));
    return;
  }

  const list = data;

  dispatch(interventionFetchReasonsListSuccess(list));
};

export const selectItemToSaveThunk = item => dispatch => {
  dispatch(interventionSetSelectedItem(item));
};

export const updateSelectedItemToSaveInterventionThunk = intervention => dispatch => {
  dispatch(interventionUpdateSelectedItemIntervention(intervention));
};

export const saveInterventionThunk = (params = {}) => async (dispatch, getState) => {
  dispatch(interventionSetSaveStart());

  const { intervention, idPrescriptionDrug, admissionNumber } = params;
  const defaultArgs = {
    observation: '',
    idPrescriptionDrug,
    admissionNumber,
    idInterventionReason: null
  };

  const args = {
    ...defaultArgs,
    ...intervention,
    status: 's'
  };

  const { access_token } = getState().auth.identify;
  const { status, error } = await api.updateIntervention(access_token, args).catch(errorHandler);

  if (status !== 200) {
    dispatch(interventionSetSaveError(error));
    return;
  }

  dispatch(interventionSetSaveSuccess());
};

export const clearSavedInterventionStatusThunk = () => dispatch => {
  dispatch(interventionClearSavedStatus());
};

export const checkInterventionThunk = (id, idPrescription, status) => async (
  dispatch,
  getState
) => {
  dispatch(interventionCheckStart(id));

  const { access_token } = getState().auth.identify;
  const params = {
    idPrescriptionDrug: id,
    idPrescription,
    status
  };

  const { data, error } = await api.updateIntervention(access_token, params).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(interventionCheckError(error));
    return;
  }

  const success = {
    status: data.status,
    id,
    idPrescription,
    newStatus: status
  };

  dispatch(interventionCheckSuccess(success));
};

export const updateInterventionListDataThunk = intervention => dispatch => {
  dispatch(interventionUpdateList(intervention));
};

export const fetchFuturePrescriptionThunk = id => async (dispatch, getState) => {
  dispatch(interventionFetchFuturePrescriptionStart());

  const { auth } = getState();
  const { access_token } = auth.identify;
  const {
    data: { data },
    error
  } = await api.getPrescriptionDrugPeriod(access_token, id, { future: 1 }).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(interventionFetchFuturePrescriptionError(error));
    return;
  }

  dispatch(interventionFetchFuturePrescriptionSuccess(id, data));
};
