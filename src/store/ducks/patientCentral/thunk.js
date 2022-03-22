import isEmpty from 'lodash.isempty';

import api from '@services/api';
import { errorHandler } from '@utils';
import { Creators as PatientCentralCreators } from './index';

const {
  patientCentralFetchListStart,
  patientCentralFetchListError,
  patientCentralFetchListSuccess
} = PatientCentralCreators;

export const patientCentralFetchListThunk = (params = {}) => async (dispatch, getState) => {
  dispatch(patientCentralFetchListStart());

  const { access_token } = getState().auth.identify;

  const { data, error } = await api.getPatientList(access_token, params).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(patientCentralFetchListError(error));
    return;
  }

  dispatch(patientCentralFetchListSuccess(data.data));
};
