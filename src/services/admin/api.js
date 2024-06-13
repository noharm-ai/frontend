import { instance, setHeaders } from "services/api";

const api = {};
const endpoints = {
  frequency: "/admin/frequency",
  interventionReason: "/admin/intervention-reason",
  memory: "/admin/memory",
  drug: "/admin/drug",
  integration: "/admin/integration",
  segment: "/admin/segments",
  exam: "/admin/exam",
  unitConversion: "/admin/unit-conversion",
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

api.drugs = {};
api.drugs.getDrugsMissingSubstance = (params) =>
  instance.get(`${endpoints.drug}/get-missing-substance`, {
    params,
    ...setHeaders(),
  });

api.drugs.predictSubstance = (params = {}) => {
  return instance.post(`${endpoints.drug}/predict-substance`, params, {
    ...setHeaders(),
  });
};

api.unitConversion = {};
api.unitConversion.getConversionList = (params = {}) => {
  return instance.post(`${endpoints.unitConversion}/list`, params, {
    ...setHeaders(),
  });
};

api.unitConversion.saveConversions = (params = {}) => {
  return instance.post(`${endpoints.unitConversion}/save`, params, {
    ...setHeaders(),
  });
};

api.unitConversion.copyConversion = (params = {}) => {
  return instance.post(
    `${endpoints.unitConversion}/copy-unit-conversion`,
    params,
    {
      ...setHeaders(),
    }
  );
};

api.unitConversion.addDefaultUnits = (params = {}) => {
  return instance.post(
    `${endpoints.unitConversion}/add-default-units`,
    params,
    {
      ...setHeaders(),
    }
  );
};

api.integration = {};
api.integration.getStatus = (params) =>
  instance.get(`${endpoints.integration}/status`, {
    params,
    ...setHeaders(),
  });

api.integration.getList = (params) =>
  instance.get(`${endpoints.integration}/list`, {
    params,
    ...setHeaders(),
  });

api.integration.update = (params) =>
  instance.post(`${endpoints.integration}/update`, params, {
    ...setHeaders(),
  });

api.integration.prescalc = (params) => {
  if (params.cpoe) {
    return instance.get(
      `/static/${localStorage.getItem("schema")}/aggregate/${
        params.id
      }?cpoe=true`,
      {
        ...setHeaders(),
      }
    );
  }

  return instance.get(
    `/static/${localStorage.getItem("schema")}/prescription/${params.id}`,
    {
      ...setHeaders(),
    }
  );
};

/**
 * REMOTE INTEGRATION
 */
api.integrationRemote = {};
api.integrationRemote.getTemplate = (params) =>
  instance.get(`/admin/integration-remote/template`, {
    params,
    ...setHeaders(),
  });

api.integrationRemote.setProcessorState = (params) =>
  instance.post(`/admin/integration-remote/set-state`, params, {
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

const methods = {
  ...api,
  getFrequencyList,
  updateDailyFrequency,
  getIntervReasonList,
  upsertIntervReason,
  getMemoryItems,
  updateMemoryItem,
  getDrugAttributes,
  updatePriceFactor,
  copyDrugAttributes,
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

export default methods;
