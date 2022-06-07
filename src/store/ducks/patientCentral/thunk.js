import isEmpty from 'lodash.isempty';

import api from '@services/api';
import hospital from '@services/hospital';
import { errorHandler } from '@utils';

import { Creators as PatientCentralCreators } from './index';
import { Creators as PatientsCreators } from '../patients';

const {
  patientCentralFetchListStart,
  patientCentralFetchListError,
  patientCentralFetchListSuccess
} = PatientCentralCreators;
const { patientsFetchListSuccess } = PatientsCreators;

export const patientCentralFetchListThunk = (params = {}) => async (dispatch, getState) => {
  dispatch(patientCentralFetchListStart());

  const { auth, patients, app, user } = getState();
  const { list: listPatients } = patients;
  const { access_token } = auth.identify;

  const {
    data: { data },
    error
  } = await api.getPatientList(access_token, params).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(patientCentralFetchListError(error));
    return;
  }

  const requestConfig = {
    listToRequest: data,
    listToEscape: listPatients,
    nameUrl: app.config.nameUrl,
    nameHeaders: app.config.nameHeaders,
    proxy: app.config.proxy,
    useCache: true,
    userRoles: user.account.roles
  };

  const patientsList = await hospital.getPatients(access_token, requestConfig);
  const listAddedPatientName = data.map(({ idPatient, ...item }) => ({
    ...item,
    idPatient,
    namePatient: patientsList[idPatient] ? patientsList[idPatient].name : `Paciente ${idPatient}`
  }));

  dispatch(patientsFetchListSuccess(patientsList));
  dispatch(patientCentralFetchListSuccess(listAddedPatientName));
};
