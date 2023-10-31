import { instance, setHeaders } from "services/api";

const endpoints = {
  frequency: "/admin/frequency",
  interventionReason: "/admin/intervention-reason",
  memory: "/admin/memory",
  drug: "/admin/drug",
};

const getFrequencyList = (bearerToken, params = {}) =>
  instance.get(endpoints.frequency, { params, ...setHeaders(bearerToken) });

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

const getMemoryItems = (bearerToken, params = {}) =>
  instance.get(endpoints.memory, {
    params,
    ...setHeaders(bearerToken),
  });

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

const fixDrugInconsistency = (params = {}) => {
  return instance.post(`${endpoints.drug}/fix-inconsistency`, params, {
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
  fixDrugInconsistency,
};

export default api;
