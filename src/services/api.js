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

const api = {};

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
export const setHeaders = () => {
  const token = localStorage.getItem("ac1") + localStorage.getItem("ac2");

  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": appInfo.apiKey,
          "nh-app-version": process.env.REACT_APP_VERSION,
        },
      }
    : {
        headers: {
          "x-api-key": appInfo.apiKey,
          "nh-app-version": process.env.REACT_APP_VERSION,
        },
      };
};

/**
 * Authentication.
 * Loggin and refresh token...
 */

const preAuth = (params) =>
  instance.post("/pre-auth", params, {
    headers: {
      "x-api-key": appInfo.apiKey,
    },
  });

const authenticate = (params) =>
  instance.post(endpoints.authentication, params, {
    withCredentials: true,
    headers: {
      "x-api-key": appInfo.apiKey,
    },
  });

const authenticateOAuth = (params) =>
  instance.post(endpoints.oauth, params, {
    withCredentials: true,
    headers: {
      "x-api-key": appInfo.apiKey,
    },
  });

const refreshToken = () =>
  instance.post(
    endpoints.refreshToken,
    {},
    {
      withCredentials: true,
      headers: {
        "x-api-key": appInfo.apiKey,
        // remove after transition
        // Authorization: `Bearer ${
        //   localStorage.getItem("rt1") + localStorage.getItem("rt2")
        // }`,
      },
    }
  );

const getAuthProvider = (schema) =>
  instance.get(`${endpoints.oauth}/${schema}`, { ...setHeaders() });

/**
 * Segments.
 *
 */
const getSegments = (bearerToken, params = {}) =>
  instance.get(endpoints.segments, { params, ...setHeaders(bearerToken) });

const generateDrugOutlier = (bearerToken, { idSegment, idDrug, ...params }) =>
  instance.post(
    `/segments/${idSegment}/outliers/generate/drug/${idDrug}/clean/1`,
    params,
    setHeaders(bearerToken)
  );

const getExamRefs = (bearerToken) =>
  instance.get(`${endpoints.segments}/exams/refs`, {
    ...setHeaders(bearerToken),
  });

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
  instance.get(
    idSegment ? `${endpoints.drugs}/${idSegment}` : endpoints.drugs,
    {
      params,
      ...setHeaders(bearerToken),
    }
  );

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
  instance.get(`${endpoints.drugs}/resources/${idDrug}/${idSegment}`, {
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
 * Score Wizard
 */

const scorePrepareGeneration = (params) =>
  instance.post(
    `/outliers/generate/prepare/${params.idSegment}/${params.idDrug}`,
    {},
    {
      ...setHeaders(),
    }
  );

const scoreGenerateSingle = (params) =>
  instance.post(
    `/outliers/generate/single/${params.idSegment}/${params.idDrug}`,
    {},
    {
      ...setHeaders(),
    }
  );

const scoreAddHistory = (params) =>
  instance.post(
    `/outliers/generate/add-history/${params.idSegment}/${params.idDrug}`,
    {},
    {
      ...setHeaders(),
    }
  );

const scoreRemoveOutlier = (params) =>
  instance.post(
    `/outliers/generate/remove-outlier/${params.idSegment}/${params.idDrug}`,
    {},
    {
      ...setHeaders(),
    }
  );

const scoreConfigDrug = (params) =>
  instance.post(
    `/outliers/generate/config/${params.idSegment}/${params.idDrug}`,
    params,
    {
      ...setHeaders(),
    }
  );

/**
 * Prescription single
 */
api.prescription = {};
api.prescription.startEvaluation = (params) =>
  instance.post(`/prescriptions/start-evaluation`, params, {
    ...setHeaders(),
  });

api.prescription.setStatus = (params) =>
  instance.post(`/prescriptions/status`, params, {
    ...setHeaders(),
  });

api.prescription.review = (params) =>
  instance.post(`/prescriptions/review`, params, {
    ...setHeaders(),
  });

/**
 * Conciliation
 */
api.conciliation = {};
api.conciliation.createConciliation = (params) =>
  instance.post(`/conciliation/create`, params, {
    ...setHeaders(),
  });

api.conciliation.getAvailableConciliations = (params) =>
  instance.get(`/conciliation/list-available`, {
    params,
    ...setHeaders(),
  });

/**
 * substance namespace
 */
api.substance = {};
api.substance.findSubstances = (term) =>
  instance.get(`${endpoints.substance}/find`, {
    params: {
      term,
    },
    ...setHeaders(),
  });

api.substance.findSubstanceClasses = (term) =>
  instance.get(`${endpoints.substance}/class/find`, {
    params: {
      term,
    },
    ...setHeaders(),
  });

api.substance.getHandling = (params) =>
  instance.get(`${endpoints.substance}/handling`, {
    params,
    ...setHeaders(),
  });

/**
 * drugs namespace
 */
api.drugs = {};
api.drugs.getDrugAttributes = (idSegment, idDrug) =>
  instance.get(`/drugs/attributes/${idSegment}/${idDrug}`, {
    ...setHeaders(),
  });

api.drugs.saveDrugAttributes = (params) =>
  instance.post(`/drugs/attributes`, params, {
    ...setHeaders(),
  });

api.drugs.updateSubstance = (params = {}) => {
  return instance.post(`/drugs/substance`, params, {
    ...setHeaders(),
  });
};

/**
 * support namespace
 */
api.support = {};
api.support.getTickets = () =>
  instance.get(`/support/list-tickets`, {
    ...setHeaders(),
  });

api.support.createTicket = (params) => {
  const formData = new FormData();

  if (params.fileList.length) {
    params.fileList.forEach((f) => {
      formData.append("fileList[]", f);
    });
  }

  Object.keys(params).forEach((k) => {
    if (k !== "fileList") {
      formData.append(k, params[k]);
    }
  });

  const config = setHeaders();
  config.headers["content-type"] = "multipart/form-data";

  return instance.post(`/support/create-ticket`, formData, config);
};

/**
 * Summary namespace
 */
api.summary = {};
api.summary.getSummary = (admissionNumber, mock) =>
  instance.get(`${endpoints.summary}/${admissionNumber}`, {
    params: {
      mock,
    },
    ...setHeaders(),
  });

api.summary.prompt = (params = {}) => {
  return instance.post(`/summary/prompt`, params, {
    ...setHeaders(),
  });
};

/**
 * Intervention
 */
api.intervention = {};
api.intervention.getOutcomeData = (params) =>
  instance.get(`/intervention/outcome-data`, {
    params,
    ...setHeaders(),
  });

api.intervention.setOutcome = (params = {}) => {
  return instance.post(`/intervention/set-outcome`, params, {
    ...setHeaders(),
  });
};

/**
 * ClinicalNotes namespace
 */
api.clinicalNotes = {};
api.clinicalNotes.removeAnnotation = (params = {}) => {
  return instance.post("/notes/remove-annotation", params, {
    ...setHeaders(),
  });
};

api.clinicalNotes.getSingle = (params) =>
  instance.get(`/notes/single/${params.id}`, {
    params,
    ...setHeaders(),
  });

api.clinicalNotes.getUserLast = (params) =>
  instance.get(`/notes/get-user-last`, {
    params,
    ...setHeaders(),
  });

/**
 * User admin
 */
api.userAdmin = {};
api.userAdmin.upsertUser = (params = {}) =>
  instance.post(endpoints.editUser, params, { ...setHeaders() });

api.userAdmin.getUsers = (params = {}) =>
  instance.get(endpoints.users, { params, ...setHeaders() });

/**
 * Segment namespace
 */
api.segments = {};
api.segments.getDepartments = (params = {}) =>
  instance.get(`${endpoints.segments}/departments`, {
    params,
    ...setHeaders(),
  });

/**
 * API
 * all functions that can be used in API.
 */
const methods = {
  ...api,
  authenticate,
  preAuth,
  authenticateOAuth,
  refreshToken,
  getAuthProvider,
  getSegments,
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
  generateDrugOutlier,
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
  getSubstanceClasses,
  getSubstanceRelations,
  shouldUpdatePrescription,
  getMemory,
  putMemory,
  putMemoryUnique,
  updatePassword,
  forgotPassword,
  resetPassword,
  getUsers,
  getClinicalNotes,
  updateClinicalNote,
  createClinicalNote,
  searchUsers,
  savePrescriptionDrug,
  suspendPrescriptionDrug,
  getDrugResources,
  getExamRefs,
  searchPrescriptions,
  getPrescriptionMissingDrugs,
  copyPrescriptionMissingDrugs,
  scorePrepareGeneration,
  scoreGenerateSingle,
  scoreConfigDrug,
  scoreAddHistory,
  scoreRemoveOutlier,
};

export default methods;
