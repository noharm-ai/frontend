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
  refreshToken: '/refresh-token',
  authentication: '/authenticate',
  prescriptions: '/prescriptions',
  drugs: '/drugs',
  departments: '/departments',
  outliers: '/outliers',
  intervention: {
    base: '/intervention',
    reasons: '/intervention/reasons'
  }
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

const createSegment = (bearerToken, params = {}) =>
  instance.post(endpoints.segments, params, setHeaders(bearerToken));

const updateSegment = (bearerToken, { id, ...params }) =>
  instance.put(`${endpoints.segments}/${id}`, params, setHeaders(bearerToken));

/**
 * Prescriptions.
 *
 */
const getPrescriptions = (bearerToken, params = {}) =>
  instance.get(endpoints.prescriptions, { params, ...setHeaders(bearerToken) });

const getPrescriptionById = (bearerToken, idPrescription, params = {}) =>
  instance.get(`${endpoints.prescriptions}/${idPrescription}`, {
    params,
    ...setHeaders(bearerToken)
  });

const putPrescriptionById = (bearerToken, idPrescription, params = {}) =>
  instance.put(`${endpoints.prescriptions}/${idPrescription}`, params, setHeaders(bearerToken));

/**
 * Patients.
 *
 */
const getResolveNamesUrl = bearerToken =>
  instance.get(endpoints.resolveNamesUrl, { ...setHeaders(bearerToken) });

/**
 * Drugs.
 *
 */
const getDrugs = (bearerToken, params = {}) =>
  instance.get(endpoints.drugs, { params, ...setHeaders(bearerToken) });

/**
 * Departments.
 *
 */
const getFreeDepartments = (bearerToken, params = {}) =>
  instance.get(`${endpoints.departments}/free`, { params, ...setHeaders(bearerToken) });

/**
 * Outliers.
 *
 */
const getOutliersBySegmentAndDrug = (bearerToken, { idSegment, idDrug, ...params }) =>
  instance.get(`${endpoints.outliers}/${idSegment}/${idDrug}`, {
    params,
    ...setHeaders(bearerToken)
  });

const putManualScore = (bearerToken, idOutlier, params = {}) =>
  instance.put(`${endpoints.outliers}/${idOutlier}`, params, setHeaders(bearerToken));

/**
 * Intervention.
 *
 */
const getInterventionReasons = (bearerToken, { idSegment, idDrug, ...params }) =>
  instance.get(endpoints.intervention.reasons, {
    params,
    ...setHeaders(bearerToken)
  });

const createIntervention = (bearerToken, params = {}) =>
  instance.post(endpoints.intervention.base, params, setHeaders(bearerToken));

const updateIntervention = (bearerToken, { id, ...params }) =>
  instance.put(`${endpoints.intervention.base}/${id}`, params, setHeaders(bearerToken));

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
  getPrescriptionById,
  putPrescriptionById,
  getResolveNamesUrl,
  getDrugs,
  generateOutlier,
  getFreeDepartments,
  getOutliersBySegmentAndDrug,
  putManualScore,
  getInterventionReasons,
  createIntervention,
  updateIntervention
};

export default api;
