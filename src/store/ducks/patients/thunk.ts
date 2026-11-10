import api from "services/api";
import { errorHandler } from "utils/index.js";
import {
  patientsSaveSingleStart,
  patientsSaveSingleSuccess,
  patientsSaveSingleError,
  patientsCleanCache,
} from "./patientsSlice";

type Dispatch = (action: unknown) => unknown;
type GetState = () => { auth: { identify: { access_token: string } } };

export const savePatientThunk =
  ({
    admissionNumber,
    ...params
  }: {
    admissionNumber: string | number;
    [key: string]: unknown;
  }) =>
  async (dispatch: Dispatch, getState: GetState) => {
    dispatch(patientsSaveSingleStart());

    const { access_token } = getState().auth.identify;
    // errorHandler (JS) resolves to { status, error } on failure
    const { status, data, error } = (await api
      .updatePatient(access_token, admissionNumber, params)
      .catch(errorHandler)) as {
      status?: number;
      data?: unknown;
      error?: unknown;
    };

    if (status !== 200) {
      dispatch(patientsSaveSingleError(error));
      throw error;
    }

    dispatch(patientsSaveSingleSuccess());
    return data;
  };

export const cleanCacheThunk = () => async (dispatch: Dispatch) => {
  dispatch(patientsCleanCache());
};
