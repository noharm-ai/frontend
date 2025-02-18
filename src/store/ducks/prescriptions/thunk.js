import { isEmpty } from "lodash";

import api from "services/api";
import hospital from "services/hospital";
import FeaturesService from "services/features";
import {
  transformPrescriptions,
  transformPrescription,
  transformExams,
} from "utils/transformers";
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

  prescriptionsReviewSuccess,

  prescriptionsSaveStart,
  prescriptionsSaveError,
  prescriptionsSaveSuccess,

  prescriptionsUpdateListStatus,

  prescriptionsUpdateIntervention,
  prescriptionsUpdateInterventionStatus,
  prescriptionsUpdatePrescriptionDrug,

  prescriptionsFetchPeriodStart,
  prescriptionsFetchPeriodError,
  prescriptionsFetchPeriodSuccess,

  prescriptionsFetchExamsStart,
  prescriptionsFetchExamsError,
  prescriptionsFetchExamsSuccess,

  prescriptionsIncrementClinicalNotes,

  prescriptionsRemoveNotes,

  prescriptionsActionsSetModalVisibility,

  prescriptionsMultipleCheckUpdateStatus,
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

    if (!isEmpty(error) || !data) {
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
      features: user.account.features,
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

    const featureService = FeaturesService(user.account.features);

    const list = transformPrescriptions(listAddedPatientName, {
      disableWhitelistGroup: featureService.hasDisableWhitelistGroup(),
    });

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

    if (isEmpty(data)) {
      dispatch(prescriptionsFetchSingleError("Erro ao buscar prescrição"));
      return;
    }

    const featureService = FeaturesService(user.account.features);

    const singlePrescription = transformPrescription(data, {
      disableWhitelistGroup: featureService.hasDisableWhitelistGroup(),
    });
    const requestConfig = {
      listToRequest: [singlePrescription],
      listToEscape: listPatients,
      nameUrl: app.config.nameUrl,
      proxy: app.config.proxy,
      nameHeaders: app.config.nameHeaders,
      useCache: false,
      userRoles: user.account.roles,
      features: user.account.features,
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
  (idPrescription, status, params = {}) =>
  async (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      dispatch(prescriptionsCheckStart(idPrescription));

      const { data, error } = await api.prescription
        .setStatus({
          idPrescription,
          status,
          evaluationTime: window.noharm?.pageTimer?.getCurrentTime(),
          alerts: params?.alerts,
        })
        .catch(errorHandler);

      if (!isEmpty(error)) {
        dispatch(prescriptionsCheckError(error));
        reject(error);
        return;
      }

      const success = {
        idPrescription: idPrescription,
        newStatus: status,
        list: data.data,
        user: getState().user.account.userName,
        userId: getState().user.account.userId,
      };

      dispatch(prescriptionsCheckSuccess(success));
      resolve(success);
    });
  };

export const reviewPatientThunk =
  (idPrescription, reviewType) => async (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      const { data, error } = await api.prescription
        .review({
          idPrescription,
          evaluationTime: window.noharm?.pageTimer?.getCurrentTime(),
          reviewType,
        })
        .catch(errorHandler);

      if (!isEmpty(error)) {
        reject(error);
        return;
      }

      dispatch(prescriptionsReviewSuccess(data.data));
      resolve(data.data);
    });
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
        dispatch(prescriptionsSaveError(null));
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
        dispatch(prescriptionsSaveError(null));
        reject(error);
        return;
      }

      dispatch(prescriptionsSaveSuccess(params, formId));
      resolve();
    });
  };

export const updateInterventionDataThunk = (intervention) => (dispatch) => {
  dispatch(prescriptionsUpdateIntervention(intervention));
};

export const updateInterventionStatusThunk =
  (idIntervention, status) => (dispatch) => {
    dispatch(prescriptionsUpdateInterventionStatus(idIntervention, status));
  };

export const updatePrescriptionDrugDataThunk =
  (idPrescriptionDrug, source, data) => (dispatch) => {
    dispatch(
      prescriptionsUpdatePrescriptionDrug(idPrescriptionDrug, source, data)
    );
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

export const setModalVisibilityThunk = (modalKey, visible) => (dispatch) => {
  dispatch(prescriptionsActionsSetModalVisibility(modalKey, visible));
};

export const removeNotesThunk =
  (idClinicalNotes, annotationType) => (dispatch) => {
    return new Promise(async (resolve, reject) => {
      const { data, error } = await api.clinicalNotes
        .removeAnnotation({
          idClinicalNotes,
          annotationType,
        })
        .catch(errorHandler);

      if (!isEmpty(error)) {
        reject(error);
        return;
      }

      dispatch(prescriptionsRemoveNotes(idClinicalNotes, annotationType));
      resolve(data.data);
    });
  };

export const multipleCheckUpdateStatusThunk = (data, status) => (dispatch) => {
  dispatch(prescriptionsMultipleCheckUpdateStatus(data, status));
};
