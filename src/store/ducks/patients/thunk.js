import api from "services/api";
import { errorHandler } from "utils";
import { Creators as PatientCreators } from "./index";

const {
  patientsSaveSingleStart,
  patientsSaveSingleSuccess,
  patientsSaveSingleError,
} = PatientCreators;

export const savePatientThunk =
  ({ admissionNumber, ...params }) =>
  (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      dispatch(patientsSaveSingleStart());

      const { access_token } = getState().auth.identify;
      const { status, error } = await api
        .updatePatient(access_token, admissionNumber, params)
        .catch(errorHandler);

      if (status !== 200) {
        dispatch(patientsSaveSingleError(error));
        reject(error);
        return;
      }

      dispatch(patientsSaveSingleSuccess());
      resolve();
    });
  };
