import isEmpty from 'lodash.isempty';

import api from '@services/api';
import hospital from '@services/hospital';
import { errorHandler, toObject } from '@utils';
import {
  transformPrescriptions,
  transformPrescription,
  transformSegment
} from '@utils/transformers';
import { Creators as PatientsCreators } from '../patients';
import { Creators as SegmentsCreators } from '../segments';
import { Creators as PrescriptionsCreators } from './index';

const { patientsFetchListSuccess } = PatientsCreators;

const {
  segmentsFetchSingleStart,
  segmentsFetchSingleError,
  segmentsFetchSingleSuccess
} = SegmentsCreators;

const {
  prescriptionsFetchListStart,
  prescriptionsFetchListError,
  prescriptionsFetchListSuccess,

  prescriptionsFetchSingleStart,
  prescriptionsFetchSingleError,
  prescriptionsFetchSingleSuccess,

  prescriptionsCheckStart,
  prescriptionsCheckError,
  prescriptionsCheckSuccess,

  prescriptionDrugCheckStart,
  prescriptionDrugCheckError,
  prescriptionDrugCheckSuccess,

  prescriptionsUpdateListStatus,

  prescriptionsUpdateIntervention,

  prescriptionInterventionCheckStart,
  prescriptionInterventionCheckError,
  prescriptionInterventionCheckSuccess
} = PrescriptionsCreators;

export const fetchPrescriptionsListThunk = (params = {}) => async (dispatch, getState) => {
  dispatch(prescriptionsFetchListStart());

  const { auth, patients } = getState();
  const { list: listPatients } = patients;
  const { access_token } = auth.identify;
  const {
    data: { data },
    error
  } = await api.getPrescriptions(access_token, params).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(prescriptionsFetchListError(error));
    return;
  }

  const requestConfig = {
    listToRequest: data,
    listToEscape: listPatients
  };

  const patientsList = await hospital.getPatients(access_token, requestConfig);
  const patientsHandled = toObject(patientsList, 'idPatient');
  const listAddedPatientName = data.map(({ idPatient, ...item }) => ({
    ...item,
    idPatient,
    namePatient: patientsHandled[idPatient].name
  }));

  const list = transformPrescriptions(listAddedPatientName);

  dispatch(patientsFetchListSuccess(patientsHandled));
  dispatch(prescriptionsFetchListSuccess(list));
};

export const updatePrescriptionStatusThunk = (params = {}) => async (dispatch, getState) => {
  const { auth } = getState();
  const { access_token } = auth.identify;
  const {
    data: { data },
    error
  } = await api.getPrescriptionsStatus(access_token, params).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(prescriptionsFetchListError(error));
    return;
  }

  dispatch(prescriptionsUpdateListStatus(data));
};

export const fetchPrescriptionByIdThunk = idPrescription => async (dispatch, getState) => {
  dispatch(prescriptionsFetchSingleStart());

  const { auth, patients } = getState();
  const { list: listPatients } = patients;
  const { access_token } = auth.identify;
  const {
    data: { data },
    error
  } = await api.getPrescriptionById(access_token, idPrescription).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(prescriptionsFetchSingleError(error));
    return;
  }

  const single = transformPrescription(data);

  const requestConfig = {
    listToRequest: [single],
    listToEscape: listPatients
  };

  const patientsList = toObject(
    await hospital.getPatients(access_token, requestConfig),
    'idPatient'
  );

  const singleAddedPatientName = {
    ...single,
    namePatient: patientsList[single.idPatient].name
  };

  dispatch(patientsFetchListSuccess(patientsList));
  dispatch(prescriptionsFetchSingleSuccess(singleAddedPatientName));
};

/**
 * Fetch data for Screening page.
 * @param {number} idPrescription
 */
export const fetchScreeningThunk = idPrescription => async (dispatch, getState) => {
  dispatch(prescriptionsFetchSingleStart());
  dispatch(segmentsFetchSingleStart());

  const { auth, patients } = getState();
  const { list: listPatients } = patients;
  const { access_token } = auth.identify;
  const {
    data: { data },
    error
  } = await api.getPrescriptionById(access_token, idPrescription).catch(errorHandler);

  if (!isEmpty(error)) {
    let errorSegment = {
      message: 'Não foi possivel carregar o segmento.'
    };

    dispatch(prescriptionsFetchSingleError(error));
    dispatch(segmentsFetchSingleError(errorSegment));
    return;
  }

  const singlePrescription = transformPrescription(data);

  const requestConfig = {
    listToRequest: [singlePrescription],
    listToEscape: listPatients
  };

  const patientsList = toObject(
    await hospital.getPatients(access_token, requestConfig),
    'idPatient'
  );

  const singlePrescriptionAddedPatientName = {
    ...singlePrescription,
    namePatient: patientsList[singlePrescription.idPatient].name
  };

  const {
    data: { data: segment }
  } = await api.getSegmentById(access_token, singlePrescription.idSegment).catch(errorHandler);
  const singleSegment = transformSegment(segment);

  dispatch(patientsFetchListSuccess(patientsList));
  dispatch(segmentsFetchSingleSuccess(singleSegment));
  dispatch(prescriptionsFetchSingleSuccess(singlePrescriptionAddedPatientName));
};

export const checkScreeningThunk = (idPrescription, status) => async (dispatch, getState) => {
  dispatch(prescriptionsCheckStart(idPrescription));

  const { access_token } = getState().auth.identify;
  const params = {
    status
  };
  const { data, error } = await api
    .putPrescriptionById(access_token, idPrescription, params)
    .catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(prescriptionsCheckError(error));
    return;
  }

  const success = {
    status: data.status,
    id: data.data,
    newStatus: status
  };

  dispatch(prescriptionsCheckSuccess(success));
};

export const checkPrescriptionDrugThunk = (idPrescriptionDrug, status, type) => async (
  dispatch,
  getState
) => {
  dispatch(prescriptionDrugCheckStart(idPrescriptionDrug));

  const { access_token } = getState().auth.identify;
  const params = {
    idPrescriptionDrug,
    status
  };

  const { data, error } = await api.updateIntervention(access_token, params).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(prescriptionDrugCheckError(error));
    return;
  }

  const success = {
    status: data.status,
    id: data.data,
    newStatus: status,
    type
  };

  dispatch(prescriptionDrugCheckSuccess(success));
};

export const updateInterventionDataThunk = (
  idPrescriptionDrug,
  source,
  intervention
) => dispatch => {
  dispatch(prescriptionsUpdateIntervention(idPrescriptionDrug, source, intervention));
};

export const checkInterventionThunk = (id, status) => async (dispatch, getState) => {
  dispatch(prescriptionInterventionCheckStart(id));

  const { access_token } = getState().auth.identify;
  const params = {
    idPrescriptionDrug: id,
    status
  };

  const { data, error } = await api.updateIntervention(access_token, params).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(prescriptionInterventionCheckError(error));
    return;
  }

  const success = {
    status: data.status,
    id,
    newStatus: status
  };

  dispatch(prescriptionInterventionCheckSuccess(success));
};
