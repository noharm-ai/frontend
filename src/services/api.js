import axios from 'axios';

/**
 * AXIOS instance.
 * Intantiated axios to auto request from API Url.
 */
const requestConfig = {
  baseURL: process.env.REACT_APP_API_URL
};

const instance = axios.create(requestConfig);

/**
 * Endpoints.
 * All endpoints that can be accessible in API.
 */
const endpoints = {
  segments: '/segments',
  resolveNamesUrl: '/user/name-url',
  patient: '/patient',
  patientName: '/patient-name',
  refreshToken: '/refresh-token',
  authentication: '/authenticate',
  prescriptions: '/prescriptions',
  drugs: '/drugs',
  departments: '/departments',
  outliers: '/outliers',
  relation: '/relation',
  intervention: {
    base: '/intervention',
    reasons: '/intervention/reasons'
  },
  exams: '/exams',
  reports: '/reports',
  substance: '/substance'
};

/**
 * Request config.
 * Set Authorization for API requests.
 */
const setHeaders = token =>
  token
    ? {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    : {};

/**
 * Authentication.
 * Loggin and refresh token...
 */
const authenticate = params => instance.post(endpoints.authentication, params);

const refreshToken = token => instance.post(endpoints.refreshToken, {}, setHeaders(token));

/**
 * Segments.
 *
 */
const getSegments = (bearerToken, params = {}) =>
  instance.get(endpoints.segments, { params, ...setHeaders(bearerToken) });

const getSegmentById = (bearerToken, idSegment, params = {}) =>
  instance.get(`${endpoints.segments}/${idSegment}`, { params, ...setHeaders(bearerToken) });

const generateOutlier = (bearerToken, idSegment) =>
  instance.get(`${endpoints.segments}/${idSegment}/outliers/generate`, {
    ...setHeaders(bearerToken)
  });

const generateDrugOutlier = (bearerToken, { idSegment, idDrug, ...params }) =>
  instance.get(`/segments/${idSegment}/outliers/generate/drug/${idDrug}/clean/1`, {
    params,
    ...setHeaders(bearerToken)
  });

const createSegment = (bearerToken, params = {}) =>
  instance.post(endpoints.segments, params, setHeaders(bearerToken));

const updateSegment = (bearerToken, { id, ...params }) =>
  instance.put(`${endpoints.segments}/${id}`, params, setHeaders(bearerToken));

/**
 * Exams.
 *
 */
const getExams = (bearerToken, admissionNumber, params = {}) =>
  instance.get(`${endpoints.exams}/${admissionNumber}`, { params, ...setHeaders(bearerToken) });

/**
 * Prescriptions.
 *
 */
const getPrescriptions = (bearerToken, params = {}) =>
  instance.get(endpoints.prescriptions, { params, ...setHeaders(bearerToken) });

const getPrescriptionsStatus = (bearerToken, params = {}) =>
  instance.get(`${endpoints.prescriptions}/status`, { params, ...setHeaders(bearerToken) });

const getPrescriptionById = (bearerToken, idPrescription, params = {}) =>
  instance.get(`${endpoints.prescriptions}/${idPrescription}`, {
    params,
    ...setHeaders(bearerToken)
  });

const getPrescriptionDrugPeriod = (bearerToken, idPrescriptionDrug, params = {}) =>
  instance.get(`${endpoints.prescriptions}/drug/${idPrescriptionDrug}/period`, {
    params,
    ...setHeaders(bearerToken)
  });

const putPrescriptionById = (bearerToken, idPrescription, params = {}) =>
  instance.put(`${endpoints.prescriptions}/${idPrescription}`, params, setHeaders(bearerToken));

const updatePrescriptionDrug = (bearerToken, idPrescriptionDrug, params = {}) =>
  instance.put(
    `${endpoints.prescriptions}/drug/${idPrescriptionDrug}`,
    params,
    setHeaders(bearerToken)
  );

/**
 * Patients.
 *
 */
const getResolveNamesUrl = bearerToken =>
  instance.get(endpoints.resolveNamesUrl, { ...setHeaders(bearerToken) });

const getPatient = (bearerToken, idPatient) =>
  instance.get(`${endpoints.patientName}/${idPatient}`, { ...setHeaders(bearerToken) });

const updatePatient = (bearerToken, admissionNumber, params = {}) =>
  instance.post(`${endpoints.patient}/${admissionNumber}`, params, setHeaders(bearerToken));

/**
 * Drugs.
 *
 */
const getDrugs = (bearerToken, params = {}) =>
  instance.get(endpoints.drugs, { params, ...setHeaders(bearerToken) });

const getDrugsBySegment = (bearerToken, idSegment, params = {}) =>
  instance.get(`${endpoints.drugs}/${idSegment}`, {
    params,
    ...setHeaders(bearerToken)
  });

const updateDrug = (bearerToken, { id, ...params }) =>
  instance.put(`${endpoints.drugs}/${id}`, params, setHeaders(bearerToken));

const getDrugUnits = (bearerToken, { id, ...params }) =>
  instance.get(`${endpoints.drugs}/${id}/units`, { params, ...setHeaders(bearerToken) });

const updateUnitCoefficient = (bearerToken, idDrug, idMeasureUnit, params = {}) =>
  instance.post(
    `${endpoints.drugs}/${idDrug}/convertunit/${idMeasureUnit}`,
    params,
    setHeaders(bearerToken)
  );

/**
 * Departments.
 *
 */
const getFreeDepartments = (bearerToken, params = {}) =>
  instance.get(`${endpoints.departments}/free`, { params, ...setHeaders(bearerToken) });

const getDepartmentsBySegment = (bearerToken, idSegment, params = {}) =>
  instance.get(`${endpoints.segments}/${idSegment}`, { params, ...setHeaders(bearerToken) });

/**
 * Outliers.
 *
 */
const getOutliersBySegmentAndDrug = (bearerToken, { idSegment, idDrug, ...params }) =>
  instance.get(`${endpoints.outliers}/${idSegment}/${idDrug}`, {
    params,
    ...setHeaders(bearerToken)
  });

const updateOutlier = (bearerToken, idOutlier, params = {}) =>
  instance.put(`${endpoints.outliers}/${idOutlier}`, params, setHeaders(bearerToken));

const updateOutlierRelation = (bearerToken, { sctidA, sctidB, type, ...params }) =>
  instance.put(
    `${endpoints.relation}/${sctidA}/${sctidB}/${type}`,
    params,
    setHeaders(bearerToken)
  );

const getSubstances = (bearerToken, params = {}) =>
  instance.get(endpoints.substance, {
    params,
    ...setHeaders(bearerToken)
  });

/**
 * Intervention.
 *
 */
const getInterventions = (bearerToken, { params }) =>
  instance.get(endpoints.intervention.base, {
    params,
    ...setHeaders(bearerToken)
  });

const getInterventionReasons = (bearerToken, { idSegment, idDrug, ...params }) =>
  instance.get(endpoints.intervention.reasons, {
    params,
    ...setHeaders(bearerToken)
  });

const updateIntervention = (bearerToken, { idPrescriptionDrug, ...params }) =>
  instance.put(
    `${endpoints.intervention.base}/${idPrescriptionDrug}`,
    params,
    setHeaders(bearerToken)
  );

/**
 * Reports
 */

const getReports = (bearerToken, params = {}) =>
  instance.get(endpoints.reports, {
    params,
    ...setHeaders(bearerToken)
  });

/**
 * API
 * all functions that can be user in API.
 */
const api = {
  authenticate,
  refreshToken,
  getSegments,
  getSegmentById,
  createSegment,
  updateSegment,
  getPrescriptions,
  getPrescriptionsStatus,
  getPrescriptionById,
  getPrescriptionDrugPeriod,
  putPrescriptionById,
  getResolveNamesUrl,
  getPatient,
  getDrugs,
  getDrugsBySegment,
  updateDrug,
  getDrugUnits,
  updateUnitCoefficient,
  generateOutlier,
  generateDrugOutlier,
  getFreeDepartments,
  getDepartmentsBySegment,
  getOutliersBySegmentAndDrug,
  updateOutlier,
  updateOutlierRelation,
  getInterventionReasons,
  updateIntervention,
  getReports,
  getInterventions,
  getExams,
  updatePatient,
  updatePrescriptionDrug,
  getSubstances
};

export default api;
