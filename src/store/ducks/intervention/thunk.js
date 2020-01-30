import isEmpty from 'lodash.isempty';

import api from '@services/api';
import { errorHandler } from '@utils';
import { Creators as InterventionCreators } from './index';

const {
  interventionFetchReasonsListStart,
  interventionFetchReasonsListError,
  interventionFetchReasonsListSuccess,

  interventionSetSelectedItem,
  interventionUpdateSelectedItemIntervention,

  interventionSetSaveStart,
  interventionSetSaveError,
  interventionSetSaveSuccess,
  interventionClearSavedStatus
} = InterventionCreators;

export const fetchReasonsListThunk = (params = {}) => async (dispatch, getState) => {
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

  const { intervention, idPrescriptionDrug } = params;
  const defaultArgs = {
    propagation: 'N',
    observation: '',
    idPrescriptionDrug,
    idInterventionReason: null
  };

  const args = {
    ...defaultArgs,
    ...intervention
  };

  const { access_token } = getState().auth.identify;
  const method = args.id ? 'updateIntervention' : 'createIntervention';

  const { status, error } = await api[method](access_token, args).catch(errorHandler);

  if (status !== 200) {
    dispatch(interventionSetSaveError(error));
    return;
  }

  dispatch(interventionSetSaveSuccess());
};

export const clearSavedInterventionStatusThunk = () => dispatch => {
  dispatch(interventionClearSavedStatus());
};
