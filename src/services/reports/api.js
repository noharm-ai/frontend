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

api.live.getAntimicrobialHistoryReport = (params = {}) =>
  instance.get(`/reports/antimicrobial/history`, {
    params,
    ...setHeaders(),
  });

api.live.getPrescriptionHistoryReport = (params = {}) =>
  instance.get(`/reports/prescription/history`, {
    params,
    ...setHeaders(),
  });

export default api;
