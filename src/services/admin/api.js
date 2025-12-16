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
  unit: "/admin/unit",
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

const upsertSegment = (params = {}) => {
  return instance.post(`${endpoints.segment}`, params, {
    ...setHeaders(),
  });
};

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
    }
  );
};

/**
 * UNIT CONVERSION
 */

api.unitConversion = {};
api.unitConversion.getConversionList = (params = {}) => {
  return instance.post(`${endpoints.unitConversion}/list`, params, {
    ...setHeaders(),
  });
};

api.unitConversion.getConversionPredictions = (params = {}) => {
  return instance.post(`${endpoints.unitConversion}/predictions`, params, {
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

api.unitConversion.updateSubstanceUnitFactor = (params = {}) => {
  return instance.post(
    `${endpoints.unitConversion}/substanceunit-factor`,
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

/**
 * INTEGRATION
 */

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

api.integration.createSchema = (params) =>
  instance.post(`${endpoints.integration}/create-schema`, params, {
    ...setHeaders(),
  });

api.integration.fetchCloudConfig = (params) =>
  instance.post(`${endpoints.integration}/get-cloud-config`, params, {
    ...setHeaders(),
  });

api.integration.upsertGetname = (params) =>
  instance.post(`${endpoints.integration}/upsert-getname`, params, {
    ...setHeaders(),
  });
api.integration.upsertSecurityGroup = (params) =>
  instance.post(`${endpoints.integration}/upsert-security-group`, params, {
    ...setHeaders(),
  });
api.integration.updateUserSecurityGroup = (params) =>
  instance.post(`${endpoints.integration}/update-user-security-group`, params, {
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
    `/static/${localStorage.getItem("schema")}/prescription/${
      params.id
    }?force=true`,
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

api.integrationRemote.getQueueStatus = (params) =>
  instance.get(`/admin/integration-remote/queue-status`, {
    params,
    ...setHeaders(),
  });

api.integrationRemote.pushQueueRequest = (params) =>
  instance.post(`/admin/integration-remote/push-queue-request`, params, {
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
api.substance.getSubstances = (params = {}) => {
  return instance.post(`/admin/substance/list`, params, {
    ...setHeaders(),
  });
};

api.substance.upsertSubstance = (params = {}) => {
  return instance.post(`/admin/substance`, params, {
    ...setHeaders(),
  });
};

/**
 * RELATIONS
 */

api.relation = {};
api.relation.getRelations = (params = {}) => {
  return instance.post(`/admin/relation/list`, params, {
    ...setHeaders(),
  });
};

api.relation.upsertRelation = (params = {}) => {
  return instance.post(`/admin/relation`, params, {
    ...setHeaders(),
  });
};

/**
 * MEASURE UNITS
 */
api.measureunits = {};
api.measureunits.getMeasureUnits = (params = {}) =>
  instance.post(`${endpoints.unit}/list`, params, setHeaders());

api.measureunits.updateUnit = (params = {}) => {
  return instance.put(`${endpoints.unit}`, params, {
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

api.protocols.upsertProtocol = (params = {}) => {
  return instance.post(`/admin/protocol/upsert`, params, {
    ...setHeaders(),
  });
};

/**
 * REPORTS
 */
api.reports = {};
api.reports.getReports = (params = {}) =>
  instance.get(`/admin/report/list`, {
    params,
    ...setHeaders(),
  });

api.reports.upsertReport = (params = {}) => {
  return instance.post(`/admin/report`, params, {
    ...setHeaders(),
  });
};

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

/**
 * FREQUENCY
 */
api.frequency = {};
api.frequency.getFrequencyList = (params = {}) =>
  instance.post(`${endpoints.frequency}/list`, params, setHeaders());

api.frequency.updateFrequency = (params = {}) => {
  return instance.put(`${endpoints.frequency}`, params, {
    ...setHeaders(),
  });
};

api.frequency.inferFrequencies = (params = {}) =>
  instance.post(`${endpoints.frequency}/infer`, params, setHeaders());

const methods = {
  ...api,
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
  upsertSegment,
};

export default methods;
