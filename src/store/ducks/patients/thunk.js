import api from '@services/api';
import { errorHandler } from '@utils';
import { Creators as PatientCreators } from './index';

const {
  patientsSaveSingleStart,
  patientsSaveSingleSuccess,
  patientsSaveSingleError,
  patientsSaveSingleReset
} = PatientCreators;

export const savePatientThunk = ({ admissionNumber, ...params }) => async (dispatch, getState) => {
  dispatch(patientsSaveSingleStart());

  const { access_token } = getState().auth.identify;
  const { status, error } = await api
    .updatePatient(access_token, admissionNumber, params)
    .catch(errorHandler);

  if (status !== 200) {
    dispatch(patientsSaveSingleError(error));
    return;
  }

  dispatch(patientsSaveSingleSuccess());
  dispatch(patientsSaveSingleReset());
};
