import axios from "axios";
import appInfo from "utils/appInfo";

/**
 * AXIOS instance.
 * Intantiated axios to auto request from API Url.
 */
const requestConfig = {
  baseURL: process.env.REACT_APP_API_URL,
};

export const instance = axios.create(requestConfig);

/**
 * Endpoints.
 * All endpoints that can be accessible in API.
 */
const endpoints = {
  segments: "/segments",
  resolveNamesUrl: "/user/name-url",
  patient: "/patient",
  patientName: "/patient-name",
  refreshToken: "/refresh-token",
  authentication: "/authenticate",
  oauth: "/auth-provider",
  prescriptions: "/prescriptions",
  drugs: "/drugs",
  departments: "/departments",
  outliers: "/outliers",
  relation: "/relation",
  intervention: {
    base: "/intervention",
    reasons: "/intervention/reasons",
  },
  exams: "/exams",
  reports: "/reports",
  substance: "/substance",
  memory: "/memory",
  user: "/user",
  users: "/users",
  clinicalNotes: "/notes",
  editUser: "/editUser",
  editPrescription: "/editPrescription",
  summary: "/summary",
};

/**
 * Request config.
 * Set Authorization for API requests.
 */
export const setHeaders = (token) =>
  token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": appInfo.apiKey,
        },
      }
    : {
        headers: {
          "x-api-key": appInfo.apiKey,
        },
      };

/**
 * Authentication.
 * Loggin and refresh token...
 */
const authenticate = (params) =>
  instance.post(endpoints.authentication, params, setHeaders());

const authenticateOAuth = (params) =>
  instance.post(endpoints.oauth, params, setHeaders());

const refreshToken = (token) =>
  instance.post(endpoints.refreshToken, {}, setHeaders(token));

const getAuthProvider = (schema) =>
  instance.get(`${endpoints.oauth}/${schema}`, { ...setHeaders() });

/**
 * Segments.
 *
 */
const getSegments = (bearerToken, params = {}) =>
  instance.get(endpoints.segments, { params, ...setHeaders(bearerToken) });

const getSegmentById = (bearerToken, idSegment, idHospital, params = {}) => {
  const url = idHospital
    ? `${endpoints.segments}/${idSegment}/${idHospital}`
    : `${endpoints.segments}/${idSegment}`;

  return instance.get(url, {
    params,
    ...setHeaders(bearerToken),
  });
};

const generateOutlier = (bearerToken, idSegment) =>
  instance.get(`${endpoints.segments}/${idSegment}/outliers/generate`, {
    ...setHeaders(bearerToken),
  });

const generateOutlierFold = (bearerToken, url) =>
  instance.get(url, { ...setHeaders(bearerToken) });

const generateDrugOutlier = (bearerToken, { idSegment, idDrug, ...params }) =>
  instance.post(
    `/segments/${idSegment}/outliers/generate/drug/${idDrug}/clean/1`,
    params,
    setHeaders(bearerToken)
  );

const createSegment = (bearerToken, params = {}) =>
  instance.post(endpoints.segments, params, setHeaders(bearerToken));

const updateSegment = (bearerToken, { id, idHospital, ...params }) =>
  instance.put(
    `${endpoints.segments}/${id}/${idHospital}`,
    params,
    setHeaders(bearerToken)
  );

const updateSegmentExam = (bearerToken, { idSegment, ...params }) =>
  instance.put(
    `${endpoints.segments}/${idSegment}/exams`,
    params,
    setHeaders(bearerToken)
  );

const getExamTypes = (bearerToken, params = {}) =>
  instance.get(`${endpoints.segments}/exams/types`, {
    params,
    ...setHeaders(bearerToken),
  });

const getExamRefs = (bearerToken) =>
  instance.get(`${endpoints.segments}/exams/refs`, {
    ...setHeaders(bearerToken),
  });

const updateSegmentExamOrder = (bearerToken, idSegment, params = {}) =>
  instance.put(
    `${endpoints.segments}/${idSegment}/exams-order`,
    params,
    setHeaders(bearerToken)
  );

/**
 * Exams.
 *
 */
const getExams = (bearerToken, admissionNumber, params = {}) =>
  instance.get(`${endpoints.exams}/${admissionNumber}`, {
    params,
    ...setHeaders(bearerToken),
  });

/**
 * Prescriptions.
 *
 */
const getPrescriptions = (bearerToken, params = {}) =>
  instance.get(endpoints.prescriptions, { params, ...setHeaders(bearerToken) });

const getPrescriptionById = (bearerToken, idPrescription, params = {}) =>
  instance.get(`${endpoints.prescriptions}/${idPrescription}`, {
    params,
    ...setHeaders(bearerToken),
  });

const getPrescriptionDrugPeriod = (
  bearerToken,
  idPrescriptionDrug,
  params = {}
) =>
  instance.get(`${endpoints.prescriptions}/drug/${idPrescriptionDrug}/period`, {
    params,
    ...setHeaders(bearerToken),
  });

const putPrescriptionById = (bearerToken, idPrescription, params = {}) =>
  instance.put(
    `${endpoints.prescriptions}/${idPrescription}`,
    params,
    setHeaders(bearerToken)
  );

const updatePrescriptionDrugNote = (
  bearerToken,
  idPrescriptionDrug,
  params = {}
) =>
  instance.put(
    `${endpoints.prescriptions}/drug/${idPrescriptionDrug}`,
    params,
    setHeaders(bearerToken)
  );

const updatePrescriptionDrugForm = (bearerToken, params = {}) =>
  instance.put(
    `${endpoints.prescriptions}/drug/form`,
    params,
    setHeaders(bearerToken)
  );

const shouldUpdatePrescription = (bearerToken, idPrescription, params = {}) => {
  return instance.get(`${endpoints.prescriptions}/${idPrescription}/update`, {
    params,
    ...setHeaders(bearerToken),
  });
};

const searchPrescriptions = (bearerToken, term) =>
  instance.get(`${endpoints.prescriptions}/search`, {
    params: {
      term,
    },
    ...setHeaders(bearerToken),
  });

/**
 *
 * Edit Prescription
 */

const savePrescriptionDrug = (bearerToken, idPrescriptionDrug, params = {}) => {
  if (idPrescriptionDrug) {
    return instance.put(
      `${endpoints.editPrescription}/drug/${idPrescriptionDrug}`,
      params,
      setHeaders(bearerToken)
    );
  }

  return instance.post(
    `${endpoints.editPrescription}/drug`,
    params,
    setHeaders(bearerToken)
  );
};

const suspendPrescriptionDrug = (bearerToken, idPrescriptionDrug, suspend) => {
  return instance.put(
    `${endpoints.editPrescription}/drug/${idPrescriptionDrug}/suspend/${
      suspend ? 1 : 0
    }`,
    {},
    setHeaders(bearerToken)
  );
};

const getPrescriptionMissingDrugs = (bearerToken, idPrescription) => {
  return instance.get(
    `${endpoints.editPrescription}/${idPrescription}/missing-drugs`,
    {
      ...setHeaders(bearerToken),
    }
  );
};

const copyPrescriptionMissingDrugs = (bearerToken, idPrescription, idDrugs) => {
  return instance.post(
    `${endpoints.editPrescription}/${idPrescription}/missing-drugs/copy`,
    { idDrugs },
    setHeaders(bearerToken)
  );
};

/**
 * Patients.
 *
 */
const getResolveNamesUrl = (bearerToken) =>
  instance.get(endpoints.resolveNamesUrl, { ...setHeaders(bearerToken) });

const getPatient = (bearerToken, idPatient) =>
  instance.get(`${endpoints.patientName}/${idPatient}`, {
    ...setHeaders(bearerToken),
  });

const updatePatient = (bearerToken, admissionNumber, params = {}) =>
  instance.post(
    `${endpoints.patient}/${admissionNumber}`,
    params,
    setHeaders(bearerToken)
  );

const getPatientList = (bearerToken, params = {}) =>
  instance.get(endpoints.patient, { params, ...setHeaders(bearerToken) });
/**
 * Drugs.
 *
 */
const getDrugs = (bearerToken, params = {}) =>
  instance.get(endpoints.drugs, { params, ...setHeaders(bearerToken) });

const getDrugsBySegment = (bearerToken, idSegment, params = {}) =>
  instance.get(`${endpoints.drugs}/${idSegment}`, {
    params,
    ...setHeaders(bearerToken),
  });

const updateDrug = (bearerToken, { id, ...params }) =>
  instance.put(`${endpoints.drugs}/${id}`, params, setHeaders(bearerToken));

const getDrugUnits = (bearerToken, { id, ...params }) =>
  instance.get(`${endpoints.drugs}/${id}/units`, {
    params,
    ...setHeaders(bearerToken),
  });

const getDrugFrequencies = (bearerToken, { ...params }) =>
  instance.get(`${endpoints.drugs}/frequencies`, {
    params,
    ...setHeaders(bearerToken),
  });

const updateDrugUnits = (bearerToken, idSegment, idDrug, params = {}) =>
  instance.post(
    `${endpoints.drugs}/${idSegment}/${idDrug}/convertunit`,
    params,
    setHeaders(bearerToken)
  );

const getDrugSummary = (bearerToken, idDrug, idSegment) =>
  instance.get(`${endpoints.drugs}/summary/${idSegment}/${idDrug}`, {
    ...setHeaders(bearerToken),
  });

const getDrugResources = (bearerToken, idDrug, idSegment, idHospital) =>
  instance.get(
    `${endpoints.drugs}/resources/${idDrug}/${idSegment}/${idHospital}`,
    {
      ...setHeaders(bearerToken),
    }
  );

/**
 * Departments.
 *
 */

const getDepartmentsBySegment = (bearerToken, idSegment, params = {}) =>
  instance.get(`${endpoints.segments}/${idSegment}`, {
    params,
    ...setHeaders(bearerToken),
  });

/**
 * Outliers.
 *
 */
const getOutliersBySegmentAndDrug = (
  bearerToken,
  { idSegment, idDrug, ...params }
) =>
  instance.get(`${endpoints.outliers}/${idSegment}/${idDrug}`, {
    params,
    ...setHeaders(bearerToken),
  });

const updateOutlier = (bearerToken, idOutlier, params = {}) =>
  instance.put(
    `${endpoints.outliers}/${idOutlier}`,
    params,
    setHeaders(bearerToken)
  );

const updateOutlierRelation = (
  bearerToken,
  { sctidA, sctidB, type, ...params }
) =>
  instance.put(
    `${endpoints.relation}/${sctidA}/${sctidB}/${type}`,
    params,
    setHeaders(bearerToken)
  );

const getSubstances = (bearerToken, params = {}) =>
  instance.get(endpoints.substance, {
    params,
    ...setHeaders(bearerToken),
  });

const getSubstanceSingle = (bearerToken, id) =>
  instance.get(`${endpoints.substance}/single/${id}`, {
    params: {},
    ...setHeaders(bearerToken),
  });

const findSubstances = (bearerToken, term) =>
  instance.get(`${endpoints.substance}/find`, {
    params: {
      term,
    },
    ...setHeaders(bearerToken),
  });

const getSubstanceClasses = (bearerToken, params = {}) =>
  instance.get(`${endpoints.substance}/class`, {
    params,
    ...setHeaders(bearerToken),
  });

const getSubstanceRelations = (bearerToken, id, params = {}) =>
  instance.get(`${endpoints.substance}/${id}/relation`, {
    params,
    ...setHeaders(bearerToken),
  });

const updateSubstance = (bearerToken, { sctid, ...params }) =>
  instance.put(
    `${endpoints.substance}/${sctid}`,
    params,
    setHeaders(bearerToken)
  );

/**
 * Intervention.
 *
 */
const getInterventions = (bearerToken, params) =>
  instance.get(endpoints.intervention.base, {
    params,
    ...setHeaders(bearerToken),
  });

const searchInterventions = (bearerToken, params) =>
  instance.post(
    `${endpoints.intervention.base}/search`,
    params,
    setHeaders(bearerToken)
  );

const getInterventionReasons = (
  bearerToken,
  { idSegment, idDrug, ...params }
) =>
  instance.get(endpoints.intervention.reasons, {
    params,
    ...setHeaders(bearerToken),
  });

const updateIntervention = (bearerToken, params) =>
  instance.put(
    `${endpoints.intervention.base}`,
    params,
    setHeaders(bearerToken)
  );

/**
 * Reports
 */

const getReports = (bearerToken, params = {}) =>
  instance.get(endpoints.reports, {
    params,
    ...setHeaders(bearerToken),
  });

/**
 * Memory
 */

const getMemory = (bearerToken, type) =>
  instance.get(`${endpoints.memory}/${type}`, {
    ...setHeaders(bearerToken),
  });

const putMemory = (bearerToken, { id, ...params }) => {
  if (id) {
    return instance.put(
      `${endpoints.memory}/${id}`,
      params,
      setHeaders(bearerToken)
    );
  }

  return instance.put(`${endpoints.memory}`, params, setHeaders(bearerToken));
};

const putMemoryUnique = (bearerToken, { type, ...params }) => {
  return instance.put(
    `${endpoints.memory}/unique/${type}`,
    params,
    setHeaders(bearerToken)
  );
};

/**
 * User.
 *
 */
const createUser = (bearerToken, params = {}) =>
  instance.put(endpoints.editUser, params, setHeaders(bearerToken));

const updateUser = (bearerToken, { id, ...params }) =>
  instance.put(`${endpoints.editUser}/${id}`, params, setHeaders(bearerToken));

const updatePassword = (bearerToken, { ...params }) => {
  return instance.put(`${endpoints.user}`, params, setHeaders(bearerToken));
};

const forgotPassword = (email) => {
  return instance.get(`${endpoints.user}/forget?email=${email}`, {
    ...setHeaders(),
  });
};

const resetPassword = (token, password) => {
  return instance.post(
    `${endpoints.user}/reset`,
    { reset_token: token, newpassword: password },
    {
      ...setHeaders(),
    }
  );
};

const getUsers = (bearerToken, params = {}) =>
  instance.get(endpoints.users, { params, ...setHeaders(bearerToken) });

const searchUsers = (bearerToken, term) =>
  instance.get(`${endpoints.users}/search`, {
    params: {
      term,
    },
    ...setHeaders(bearerToken),
  });

/**
 * ClinicalNotes.
 *
 */
const getClinicalNotes = (bearerToken, admissionNumber, params) =>
  instance.get(`${endpoints.clinicalNotes}/${admissionNumber}/v2`, {
    params,
    ...setHeaders(bearerToken),
  });

const createClinicalNote = (bearerToken, params = {}) =>
  instance.post(`${endpoints.clinicalNotes}`, params, setHeaders(bearerToken));

const updateClinicalNote = (bearerToken, id, params) => {
  return instance.post(`${endpoints.clinicalNotes}/${id}`, params, {
    ...setHeaders(bearerToken),
  });
};

/**
 * Summary
 */

const getSummary = (bearerToken, admissionNumber, mock) =>
  instance.get(`${endpoints.summary}/${admissionNumber}`, {
    params: {
      mock,
    },
    ...setHeaders(bearerToken),
  });

/**
 * API
 * all functions that can be user in API.
 */
const api = {
  authenticate,
  authenticateOAuth,
  refreshToken,
  getAuthProvider,
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
  getPatientList,
  getDrugs,
  getDrugsBySegment,
  getDrugSummary,
  getDrugFrequencies,
  updateDrug,
  getDrugUnits,
  updateDrugUnits,
  generateOutlier,
  generateOutlierFold,
  generateDrugOutlier,
  getDepartmentsBySegment,
  getOutliersBySegmentAndDrug,
  updateOutlier,
  updateOutlierRelation,
  getInterventionReasons,
  updateIntervention,
  getReports,
  getInterventions,
  searchInterventions,
  getExams,
  updatePatient,
  updatePrescriptionDrugNote,
  updatePrescriptionDrugForm,
  getSubstances,
  getSubstanceSingle,
  findSubstances,
  getSubstanceClasses,
  updateSegmentExam,
  getExamTypes,
  updateSubstance,
  getSubstanceRelations,
  shouldUpdatePrescription,
  getMemory,
  putMemory,
  putMemoryUnique,
  updatePassword,
  forgotPassword,
  resetPassword,
  getUsers,
  updateSegmentExamOrder,
  getClinicalNotes,
  updateClinicalNote,
  createClinicalNote,
  createUser,
  updateUser,
  searchUsers,
  savePrescriptionDrug,
  suspendPrescriptionDrug,
  getDrugResources,
  getExamRefs,
  searchPrescriptions,
  getPrescriptionMissingDrugs,
  copyPrescriptionMissingDrugs,
  getSummary,
};

export default api;
