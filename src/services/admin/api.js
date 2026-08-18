import { instance, setHeaders } from "services/api";

const api = {};
const endpoints = {
  memory: "/admin/memory",
  drug: "/admin/drug",
  integration: "/admin/integration",
  segment: "/admin/segments",
  exam: "/admin/exam",
  unitConversion: "/admin/unit-conversion",
};

const getMemoryItems = (params = {}) =>
  instance.post(`${endpoints.memory}/list`, params, setHeaders());

const updateMemoryItem = (bearerToken, params = {}) => {
  return instance.put(`${endpoints.memory}`, params, {
    ...setHeaders(bearerToken),
  });
};

const getDrugAttributes = (params = {}) => {
  return instance.post(`${endpoints.drug}/attributes-list`, params, {
    ...setHeaders(),
  });
};

const copyDrugAttributes = (params = {}) => {
  return instance.post(`${endpoints.drug}/copy-attributes`, params, {
    ...setHeaders(),
  });
};

const refreshPrescription = (params = {}) => {
  return instance.post(
    `${endpoints.integration}/refresh-prescription`,
    params,
    {
      ...setHeaders(),
    },
  );
};

const getSegmentDepartments = (params) =>
  instance.get(`${endpoints.segment}/departments/${params.idSegment}`, {
    ...setHeaders(),
  });

const updateSegmentDepartments = (params) =>
  instance.post(`${endpoints.segment}/departments`, params, {
    ...setHeaders(),
  });

const upsertSegment = (params = {}) => {
  return instance.post(`${endpoints.segment}`, params, {
    ...setHeaders(),
  });
};

/**
 * OUTLIERS
 */
api.outliers = {};
api.outliers.refreshAgg = (params) =>
  instance.get(`/outliers/generate/refresh-agg`, {
    params,
    ...setHeaders(),
  });

api.outliers.generateSegmentOutliers = (params) =>
  instance.post(`/outliers/generate/segment`, params, {
    ...setHeaders(),
  });

/**
 * EXAMS
 */

api.exams = {};
api.exams.copyExams = (params) =>
  instance.post(`${endpoints.exam}/copy`, params, {
    ...setHeaders(),
  });

api.exams.getMostFrequentExams = (params) =>
  instance.get(`${endpoints.exam}/most-frequent`, {
    params,
    ...setHeaders(),
  });

api.exams.getExamTypes = (params) =>
  instance.get(`${endpoints.exam}/types`, {
    params,
    ...setHeaders(),
  });

api.exams.getGlobalExams = (params) =>
  instance.get(`${endpoints.exam}/list-global`, {
    params,
    ...setHeaders(),
  });

api.exams.addMostFrequentExams = (params) =>
  instance.post(`${endpoints.exam}/most-frequent/add`, params, {
    ...setHeaders(),
  });

api.exams.listExams = (params) =>
  instance.post(`${endpoints.exam}/list`, params, {
    ...setHeaders(),
  });

api.exams.upsertExam = (params) =>
  instance.post(`${endpoints.exam}/upsert`, params, {
    ...setHeaders(),
  });

api.exams.setExamsOrder = (params) =>
  instance.post(`${endpoints.exam}/order`, params, {
    ...setHeaders(),
  });

api.exams.getExam = (params) =>
  instance.post(`${endpoints.exam}/get`, params, {
    ...setHeaders(),
  });

/**
 * DRUGS
 */

api.drugs = {};
api.drugs.getDrugsMissingSubstance = (params) =>
  instance.get(`${endpoints.drug}/get-missing-substance`, {
    params,
    ...setHeaders(),
  });

api.drugs.getDrugRef = (params) =>
  instance.get(`${endpoints.drug}/ref`, {
    params,
    ...setHeaders(),
  });

api.drugs.predictSubstance = (params = {}) => {
  return instance.post(`${endpoints.drug}/predict-substance`, params, {
    ...setHeaders(),
  });
};

api.drugs.addNewOutlier = (params = {}) => {
  return instance.post(`${endpoints.drug}/add-new-outlier`, params, {
    ...setHeaders(),
  });
};

api.drugs.calculateDosemax = (params = {}) => {
  return instance.post(
    `${endpoints.drug}/calculate-dosemax`,
    {},
    {
      ...setHeaders(),
    },
  );
};

/**
 * UNIT CONVERSION
 */

api.unitConversion = {};
api.unitConversion.copyConversion = (params = {}) => {
  return instance.post(
    `${endpoints.unitConversion}/copy-unit-conversion`,
    params,
    {
      ...setHeaders(),
    },
  );
};

api.unitConversion.addDefaultUnits = (params = {}) => {
  return instance.post(
    `${endpoints.unitConversion}/add-default-units`,
    params,
    {
      ...setHeaders(),
    },
  );
};

/**
 * INTEGRATION
 */

api.integration = {};
api.integration.updateUserSecurityGroup = (params) =>
  instance.post(`${endpoints.integration}/update-user-security-group`, params, {
    ...setHeaders(),
  });

/**
 * User
 */
api.user = {};
api.user.getResetToken = (params) =>
  instance.post(`/user/reset-token`, params, {
    ...setHeaders(),
  });

/**
 * SUBSTANCE
 */

api.substance = {};
api.substance.getSubstance = (id) => {
  return instance.get(`/admin/substance/${id}`, {
    ...setHeaders(),
  });
};

/**
 * TAGS
 */
api.tag = {};
api.tag.getTags = (params = {}) =>
  instance.post(`/admin/tag/list`, params, setHeaders());

api.tag.upsertTag = (params = {}) => {
  return instance.post(`/admin/tag/upsert`, params, {
    ...setHeaders(),
  });
};

/**
 * PROTOCOLS
 */
api.protocols = {};
api.protocols.getProtocols = (params = {}) =>
  instance.post(`/admin/protocol/list`, params, setHeaders());

api.protocols.getProtocol = (id, params = {}) =>
  instance.get(`/admin/protocol/${id}`, {
    params,
    ...setHeaders(),
  });

api.protocols.upsertProtocol = (params = {}) => {
  return instance.post(`/admin/protocol/upsert`, params, {
    ...setHeaders(),
  });
};

api.protocols.getDepartments = (params = {}) =>
  instance.get(`/admin/protocol/department/list`, {
    params,
    ...setHeaders(),
  });

/**
 * GLOBAL MEMORY
 */
api.globalMemory = {};
api.globalMemory.getGlobalMemory = (params = {}) =>
  instance.post(`/admin/global-memory/list`, params, setHeaders());

api.globalMemory.updateGlobalMemory = (params = {}) => {
  return instance.post(`/admin/global-memory/update`, params, {
    ...setHeaders(),
  });
};

const methods = {
  ...api,
  getMemoryItems,
  updateMemoryItem,
  getDrugAttributes,
  copyDrugAttributes,
  refreshPrescription,
  getSegmentDepartments,
  updateSegmentDepartments,
  upsertSegment,
};

export default methods;
