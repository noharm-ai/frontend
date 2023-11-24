import { instance, setHeaders } from "services/api";

const endpoints = {
  general: "/reports/general",
};

const getGeneralPrescription = (params = {}) =>
  instance.get(`${endpoints.general}/prescription`, {
    params,
    ...setHeaders(),
  });

const getCache = (url) => {
  return instance.get(url, { responseType: "arraybuffer", decompress: true });
};

const api = {
  getGeneralPrescription,
  getCache,
};

export default api;
