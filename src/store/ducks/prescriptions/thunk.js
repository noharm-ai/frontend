import isEmpty from "lodash.isempty";

import api from "services/api";
import hospital from "services/hospital";
import {
  transformPrescriptions,
  transformPrescription,
  transformExams,
} from "utils/transformers";
import { sourceToStoreType } from "utils/transformers/prescriptions";
import { errorHandler } from "utils";
import { Creators as PatientsCreators } from "../patients";
import { Creators as PrescriptionsCreators } from "./index";

import { setDrugFormList } from "features/drugs/DrugFormStatus/DrugFormStatusSlice";

const { patientsFetchListSuccess } = PatientsCreators;

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

  prescriptionsSaveStart,
  prescriptionsSaveError,
  prescriptionsSaveSuccess,

  prescriptionDrugCheckStart,
  prescriptionDrugCheckError,
  prescriptionDrugCheckSuccess,

  prescriptionsUpdateListStatus,

  prescriptionsUpdateIntervention,
  prescriptionsUpdatePrescriptionDrug,

  prescriptionInterventionCheckStart,
  prescriptionInterventionCheckError,
  prescriptionInterventionCheckSuccess,

  prescriptionsFetchPeriodStart,
  prescriptionsFetchPeriodError,
  prescriptionsFetchPeriodSuccess,

  prescriptionsFetchExamsStart,
  prescriptionsFetchExamsError,
  prescriptionsFetchExamsSuccess,

  prescriptionsIncrementClinicalNotes,
} = PrescriptionsCreators;

export const fetchPrescriptionsListThunk =
  (params = {}) =>
  async (dispatch, getState) => {
    dispatch(prescriptionsFetchListStart());

    const { auth, patients, app, user } = getState();
    const { list: listPatients } = patients;
    const { access_token } = auth.identify;
    const {
      data: { data },
      error,
    } = await api.getPrescriptions(access_token, params).catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(prescriptionsFetchListError(error));
      return;
    }

    const requestConfig = {
      listToRequest: data,
      listToEscape: listPatients,
      nameUrl: app.config.nameUrl,
      multipleNameUrl: app.config.multipleNameUrl,
      proxy: app.config.proxy,
      nameHeaders: app.config.nameHeaders,
      useCache: true,
      userRoles: user.account.roles,
    };

    const patientsList = await hospital.getPatients(
      access_token,
      requestConfig
    );
    const listAddedPatientName = data.map(({ idPatient, ...item }) => ({
      ...item,
      idPatient,
      namePatient: patientsList[idPatient]
        ? patientsList[idPatient].name
        : `Paciente ${idPatient}`,
    }));

    const list = transformPrescriptions(listAddedPatientName);

    dispatch(patientsFetchListSuccess(patientsList));
    dispatch(prescriptionsFetchListSuccess(list));
  };

export const updatePrescriptionStatusThunk =
  (params = {}) =>
  async (dispatch, getState) => {
    const { auth } = getState();
    const { access_token } = auth.identify;
    const {
      data: { data },
      error,
    } = await api.getPrescriptions(access_token, params).catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(prescriptionsFetchListError(error));
      return;
    }

    dispatch(prescriptionsUpdateListStatus(transformPrescriptions(data)));
  };

/**
 * Fetch data for Screening page.
 * @param {number} idPrescription
 */
export const fetchScreeningThunk =
  (idPrescription) => async (dispatch, getState) => {
    dispatch(prescriptionsFetchSingleStart());

    const { auth, patients, app, user } = getState();
    const { list: listPatients } = patients;
    const { access_token } = auth.identify;
    const {
      data: { data },
      error,
    } = await api
      .getPrescriptionById(access_token, idPrescription)
      .catch(errorHandler);
    if (!isEmpty(error)) {
      dispatch(prescriptionsFetchSingleError(error));
      return;
    }

    const singlePrescription = transformPrescription(data);
    const requestConfig = {
      listToRequest: [singlePrescription],
      listToEscape: listPatients,
      nameUrl: app.config.nameUrl,
      proxy: app.config.proxy,
      nameHeaders: app.config.nameHeaders,
      useCache: false,
      userRoles: user.account.roles,
    };

    const patientsList = await hospital.getPatients(
      access_token,
      requestConfig
    );

    const singlePrescriptionAddedPatientName = {
      ...singlePrescription,
      namePatient: patientsList[singlePrescription.idPatient]
        ? patientsList[singlePrescription.idPatient].name
        : "Paciente",
    };

    const prescriptionDrugFormStatus = {};
    [
      ...singlePrescription.prescriptionRaw,
      ...singlePrescription.proceduresRaw,
      ...singlePrescription.solutionRaw,
    ].forEach((i) => {
      prescriptionDrugFormStatus[i.idPrescriptionDrug] = i.formValues;
    });

    dispatch(setDrugFormList(prescriptionDrugFormStatus));

    dispatch(patientsFetchListSuccess(patientsList));
    dispatch(
      prescriptionsFetchSingleSuccess(singlePrescriptionAddedPatientName)
    );
  };

export const checkScreeningThunk =
  (idPrescription, status) => async (dispatch, getState) => {
    dispatch(prescriptionsCheckStart(idPrescription));

    const { access_token } = getState().auth.identify;
    const params = {
      status,
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
      newStatus: status,
      user: getState().user.account.userName,
    };

    dispatch(prescriptionsCheckSuccess(success));
  };

export const savePrescriptionThunk =
  ({ idPrescription, formId, ...params }) =>
  (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      dispatch(prescriptionsSaveStart());

      const { access_token } = getState().auth.identify;
      const { error } = await api
        .putPrescriptionById(access_token, idPrescription, params)
        .catch(errorHandler);

      if (!isEmpty(error)) {
        dispatch(prescriptionsSaveError(error));
        reject(error);
        return;
      }

      dispatch(prescriptionsSaveSuccess(params, formId));
      resolve(params);
    });
  };

export const saveAdmissionThunk =
  ({ admissionNumber, formId, ...params }) =>
  async (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      dispatch(prescriptionsSaveStart());

      const { access_token } = getState().auth.identify;
      const { error } = await api
        .updatePatient(access_token, admissionNumber, params)
        .catch(errorHandler);

      if (!isEmpty(error)) {
        dispatch(prescriptionsSaveError(error));
        reject(error);
        return;
      }

      dispatch(prescriptionsSaveSuccess(params, formId));
      resolve();
    });
  };

export const checkPrescriptionDrugThunk =
  (idPrescriptionDrug, idIntervention, status, type) =>
  async (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      dispatch(
        prescriptionDrugCheckStart(idPrescriptionDrug, sourceToStoreType(type))
      );

      const { access_token } = getState().auth.identify;
      const params = {
        idIntervention,
        idPrescriptionDrug,
        status,
      };

      const { data, error } = await api
        .updateIntervention(access_token, params)
        .catch(errorHandler);

      if (!isEmpty(error)) {
        dispatch(prescriptionDrugCheckError(error, sourceToStoreType(type)));
        reject(error);
        return;
      }

      dispatch(
        prescriptionDrugCheckSuccess(data.data[0], sourceToStoreType(type))
      );
      resolve(data.data[0]);
    });
  };

export const updateInterventionDataThunk =
  (idPrescriptionDrug, source, intervention) => (dispatch) => {
    dispatch(
      prescriptionsUpdateIntervention(idPrescriptionDrug, source, intervention)
    );
  };

export const updatePrescriptionDrugDataThunk =
  (idPrescriptionDrug, source, data) => (dispatch) => {
    dispatch(
      prescriptionsUpdatePrescriptionDrug(idPrescriptionDrug, source, data)
    );
  };

export const checkInterventionThunk =
  (id, idPrescription, status, source = "intervention") =>
  async (dispatch, getState) => {
    dispatch(prescriptionInterventionCheckStart(id, source));

    const { access_token } = getState().auth.identify;
    const params = {
      idPrescriptionDrug: id,
      idPrescription,
      status,
    };

    const { data, error } = await api
      .updateIntervention(access_token, params)
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(prescriptionInterventionCheckError(error, source));
      return;
    }

    const success = {
      status: data.status,
      id,
      idPrescription,
      newStatus: status,
    };

    dispatch(prescriptionInterventionCheckSuccess(success, source));
  };

export const fetchPrescriptionDrugPeriodThunk =
  (idPrescriptionDrug, source) => async (dispatch, getState) => {
    dispatch(prescriptionsFetchPeriodStart(source));

    const { auth } = getState();
    const { access_token } = auth.identify;
    const {
      data: { data },
      error,
    } = await api
      .getPrescriptionDrugPeriod(access_token, idPrescriptionDrug)
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(prescriptionsFetchPeriodError(error, source));
      return;
    }

    dispatch(prescriptionsFetchPeriodSuccess(idPrescriptionDrug, source, data));
  };

export const fetchPrescriptionExamsThunk =
  (admissionNumber, params = {}) =>
  async (dispatch, getState) => {
    dispatch(prescriptionsFetchExamsStart());

    const { auth } = getState();
    const { access_token } = auth.identify;
    const {
      data: { data },
      error,
    } = await api
      .getExams(access_token, admissionNumber, params)
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(prescriptionsFetchExamsError(error));
      return;
    }

    dispatch(prescriptionsFetchExamsSuccess(transformExams(data)));
  };

export const incrementClinicalNotesThunk = () => (dispatch) => {
  dispatch(prescriptionsIncrementClinicalNotes());
};
