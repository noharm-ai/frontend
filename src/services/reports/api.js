import { instance, setHeaders } from "services/api";

const api = {};

api.getConfig = (params = {}) =>
  instance.get(`/reports/config`, {
    params,
    ...setHeaders(),
  });

api.getReport = (report, params = {}) =>
  instance.get(`/reports/general/${report}`, {
    params,
    ...setHeaders(),
  });

api.getCache = (url) => {
  return instance.get(url, { responseType: "arraybuffer", decompress: true });
};

api.live = {};

api.live.getCultureReport = (params = {}) =>
  instance.get(`/reports/culture`, {
    params,
    ...setHeaders(),
  });

export default api;
