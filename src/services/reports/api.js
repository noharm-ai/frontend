import { instance, setHeaders } from "services/api";

const getConfig = (params = {}) =>
  instance.get(`/reports/config`, {
    params,
    ...setHeaders(),
  });

const getReport = (report, params = {}) =>
  instance.get(`/reports/general/${report}`, {
    params,
    ...setHeaders(),
  });

const getCache = (url) => {
  return instance.get(url, { responseType: "arraybuffer", decompress: true });
};

const api = {
  getReport,
  getCache,
  getConfig,
};

export default api;
