import { instance, setHeaders } from "services/api";

const endpoints = {
  general: "/reports/general",
};

const getPatientDay = (params = {}) =>
  instance.get(`${endpoints.general}/patient-day`, {
    params,
    ...setHeaders(),
  });

const getPrescription = (params = {}) =>
  instance.get(`${endpoints.general}/prescription`, {
    params,
    ...setHeaders(),
  });

const getIntervention = (params = {}) =>
  instance.get(`${endpoints.general}/intervention`, {
    params,
    ...setHeaders(),
  });

const getCache = (url) => {
  return instance.get(url, { responseType: "arraybuffer", decompress: true });
};

const api = {
  getPatientDay,
  getPrescription,
  getIntervention,
  getCache,
};

export default api;
