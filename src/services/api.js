import axios from 'axios';
import Prismic from 'prismic-javascript';
import appInfo from '@utils/appInfo';

/**
 * AXIOS instance.
 * Intantiated axios to auto request from API Url.
 */
const requestConfig = {
  baseURL: process.env.REACT_APP_API_URL
};

const instance = axios.create(requestConfig);
const prismicClient = Prismic.client(process.env.REACT_APP_PRISMIC_API_URL, {
  accessToken: process.env.REACT_APP_PRISMIC_TOKEN
});

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
  substance: '/substance',
  memory: '/memory',
  user: '/user',
  clinicalNotes: '/notes'
};

/**
 * Request config.
 * Set Authorization for API requests.
 */
const setHeaders = token =>
  token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-api-key': appInfo.apiKey
        }
      }
    : {
        headers: {
          'x-api-key': appInfo.apiKey
        }
      };

/**
 * Authentication.
 * Loggin and refresh token...
 */
const authenticate = params => instance.post(endpoints.authentication, params, setHeaders());

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

const generateOutlierFold = (bearerToken, url) => instance.get(url, { ...setHeaders(bearerToken) });

const generateDrugOutlier = (bearerToken, { idSegment, idDrug, ...params }) =>
  instance.post(
    `/segments/${idSegment}/outliers/generate/drug/${idDrug}/clean/1`,
    params,
    setHeaders(bearerToken)
  );

const createSegment = (bearerToken, params = {}) =>
  instance.post(endpoints.segments, params, setHeaders(bearerToken));

const updateSegment = (bearerToken, { id, ...params }) =>
  instance.put(`${endpoints.segments}/${id}`, params, setHeaders(bearerToken));

const updateSegmentExam = (bearerToken, { idSegment, type, ...params }) =>
  instance.put(`${endpoints.segments}/${idSegment}/exams/${type}`, params, setHeaders(bearerToken));

const getExamTypes = (bearerToken, params = {}) =>
  instance.get(`${endpoints.segments}/exams/types`, { params, ...setHeaders(bearerToken) });

const updateSegmentExamOrder = (bearerToken, idSegment, params = {}) =>
  instance.put(`${endpoints.segments}/${idSegment}/exams-order`, params, setHeaders(bearerToken));

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

const shouldUpdatePrescription = (bearerToken, idPrescription, params = {}) => {
  return instance.get(`${endpoints.prescriptions}/${idPrescription}/update`, {
    params,
    ...setHeaders(bearerToken)
  });
};

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

const getSubstanceRelations = (bearerToken, id, params = {}) =>
  instance.get(`${endpoints.substance}/${id}/relation`, {
    params,
    ...setHeaders(bearerToken)
  });

const updateSubstance = (bearerToken, { sctid, ...params }) =>
  instance.put(`${endpoints.substance}/${sctid}`, params, setHeaders(bearerToken));

/**
 * Intervention.
 *
 */
const getInterventions = (bearerToken, params) =>
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
 * Memory
 */

const getMemory = (bearerToken, type) =>
  instance.get(`${endpoints.memory}/${type}`, {
    ...setHeaders(bearerToken)
  });

const putMemory = (bearerToken, { id, ...params }) => {
  if (id) {
    return instance.put(`${endpoints.memory}/${id}`, params, setHeaders(bearerToken));
  }

  return instance.put(`${endpoints.memory}`, params, setHeaders(bearerToken));
};

/**
 * User.
 *
 */
const updatePassword = (bearerToken, { ...params }) => {
  return instance.put(`${endpoints.user}`, params, setHeaders(bearerToken));
};

const forgotPassword = email => {
  return instance.get(`${endpoints.user}/forget?email=${email}`, { ...setHeaders() });
};

const resetPassword = (token, password) => {
  return instance.post(
    `${endpoints.user}/reset`,
    { reset_token: token, newpassword: password },
    {
      ...setHeaders()
    }
  );
};

/**
 * ClinicalNotes.
 *
 */
const getClinicalNotes = (bearerToken, admissionNumber) =>
  instance.get(`${endpoints.clinicalNotes}/${admissionNumber}`, { ...setHeaders(bearerToken) });

const updateClinicalNote = (bearerToken, id, text) => {
  return instance.post(
    `${endpoints.clinicalNotes}/${id}`,
    { text },
    {
      ...setHeaders(bearerToken)
    }
  );
};

/**
 * PRISMIC HELP
 */
const getHelp = id => {
  return prismicClient.getByUID('faq', id);
};

/**
 * PRISMIC KNOWLEDGE BASE
 */
const getKnowledgeBaseArticles = () => {
  return prismicClient.query(Prismic.Predicates.at('document.type', 'knowledgebase'), {
    orderings: '[my.knowledgebase.first_publication_date desc]'
  });
};

const getKnowledgeBaseArticleByUID = id => prismicClient.getByUID('knowledgebase', id);

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
  generateOutlierFold,
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
  getSubstances,
  updateSegmentExam,
  getExamTypes,
  getHelp,
  updateSubstance,
  getSubstanceRelations,
  shouldUpdatePrescription,
  getKnowledgeBaseArticles,
  getKnowledgeBaseArticleByUID,
  getMemory,
  putMemory,
  updatePassword,
  forgotPassword,
  resetPassword,
  updateSegmentExamOrder,
  getClinicalNotes,
  updateClinicalNote
};

export default api;
