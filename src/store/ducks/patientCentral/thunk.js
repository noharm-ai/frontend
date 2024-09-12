import isEmpty from "lodash.isempty";

import api from "services/api";
import hospital from "services/hospital";
import { errorHandler } from "utils";

import { Creators as PatientCentralCreators } from "./index";
import { Creators as PatientsCreators } from "../patients";

const {
  patientCentralFetchListStart,
  patientCentralFetchListError,
  patientCentralFetchListSuccess,

  patientCentralUpdateNames,
} = PatientCentralCreators;
const { patientsFetchListSuccess } = PatientsCreators;

export const patientCentralFetchListThunk =
  (params = {}) =>
  async (dispatch, getState) => {
    dispatch(patientCentralFetchListStart());

    const { auth } = getState();
    const { access_token } = auth.identify;

    const {
      data: { data },
      error,
    } = await api.getPatientList(access_token, params).catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(patientCentralFetchListError(error));
      return;
    }

    const listAddedPatientName = data.map(({ idPatient, ...item }) => ({
      ...item,
      idPatient,
      loadingName: true,
      namePatient: `Paciente ${idPatient}`,
    }));

    dispatch(patientCentralFetchListSuccess(listAddedPatientName));
    dispatch(patientCentralNamesThunk(data));
  };

export const patientCentralNamesThunk =
  (data) => async (dispatch, getState) => {
    const { patients, app, user } = getState();
    const { list: listPatients } = patients;

    const limit = 50;
    let offset = 0;
    const pages = Math.ceil(data.length / limit);

    for (let i = 0; i < pages; i++) {
      const items = data.slice(offset, offset + limit);
      offset = offset + limit;

      const requestConfig = {
        listToRequest: items,
        listToEscape: listPatients,
        nameUrl: app.config.nameUrl,
        nameHeaders: app.config.nameHeaders,
        proxy: app.config.proxy,
        useCache: true,
        userRoles: user.account.roles,
      };

      const patientsList = await hospital.getPatients(null, requestConfig);

      dispatch(patientsFetchListSuccess(patientsList));
      dispatch(patientCentralUpdateNames(patientsList));
    }
  };
