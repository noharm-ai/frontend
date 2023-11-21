import { instance, setHeaders } from "services/api";

const endpoints = {
  frequency: "/admin/frequency",
  interventionReason: "/admin/intervention-reason",
  memory: "/admin/memory",
  drug: "/admin/drug",
  integration: "/admin/integration",
  segment: "/admin/segments",
  exam: "/admin/exam",
};

const getFrequencyList = (params = {}) =>
  instance.post(`${endpoints.frequency}/list`, params, setHeaders());

const updateDailyFrequency = (bearerToken, id, dailyFrequency) => {
  return instance.put(
    `${endpoints.frequency}`,
    {
      id,
      dailyFrequency,
    },
    {
      ...setHeaders(bearerToken),
    }
  );
};

const getIntervReasonList = (bearerToken, params = {}) =>
  instance.get(endpoints.interventionReason, {
    params,
    ...setHeaders(bearerToken),
  });

const upsertIntervReason = (bearerToken, params = {}) => {
  return instance.post(`${endpoints.interventionReason}`, params, {
    ...setHeaders(bearerToken),
  });
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

const updatePriceFactor = (params = {}) => {
  return instance.post(`${endpoints.drug}/price-factor`, params, {
    ...setHeaders(),
  });
};

const updateSubstance = (params = {}) => {
  return instance.post(`${endpoints.drug}/substance`, params, {
    ...setHeaders(),
  });
};

const addDefaultUnits = (params = {}) => {
  return instance.post(`${endpoints.drug}/add-default-units`, params, {
    ...setHeaders(),
  });
};

const copyConversion = (params = {}) => {
  return instance.post(`${endpoints.drug}/copy-unit-conversion`, params, {
    ...setHeaders(),
  });
};

const copyDrugAttributes = (params = {}) => {
  return instance.post(`${endpoints.drug}/copy-attributes`, params, {
    ...setHeaders(),
  });
};

const refreshAggPrescription = (params = {}) => {
  return instance.post(`${endpoints.integration}/refresh-agg`, params, {
    ...setHeaders(),
  });
};

const refreshPrescription = (params = {}) => {
  return instance.post(
    `${endpoints.integration}/refresh-prescription`,
    params,
    {
      ...setHeaders(),
    }
  );
};

const initInterventionReason = (params = {}) => {
  return instance.post(
    `${endpoints.integration}/init-intervention-reason`,
    params,
    {
      ...setHeaders(),
    }
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

const getOutlierProcessList = (params) =>
  instance.post(`${endpoints.segment}/outliers/process-list`, params, {
    ...setHeaders(),
  });

const generateOutlierFold = (params) => {
  if (params.method === "POST") {
    return instance.post(params.url, params.params, setHeaders());
  }

  return instance.get(params.url, { ...setHeaders() });
};

const copyExams = (params) =>
  instance.post(`${endpoints.exam}/copy`, params, {
    ...setHeaders(),
  });

const upsertSegment = (params = {}) => {
  return instance.post(`${endpoints.segment}`, params, {
    ...setHeaders(),
  });
};

const getMostFrequentExams = (params) =>
  instance.get(`${endpoints.exam}/most-frequent`, {
    params,
    ...setHeaders(),
  });

const addMostFrequentExams = (params) =>
  instance.post(`${endpoints.exam}/most-frequent/add`, params, {
    ...setHeaders(),
  });

const api = {
  getFrequencyList,
  updateDailyFrequency,
  getIntervReasonList,
  upsertIntervReason,
  getMemoryItems,
  updateMemoryItem,
  getDrugAttributes,
  updatePriceFactor,
  addDefaultUnits,
  copyConversion,
  copyDrugAttributes,
  updateSubstance,
  refreshAggPrescription,
  refreshPrescription,
  initInterventionReason,
  getSegmentDepartments,
  updateSegmentDepartments,
  getOutlierProcessList,
  generateOutlierFold,
  copyExams,
  upsertSegment,
  getMostFrequentExams,
  addMostFrequentExams,
};

export default api;
