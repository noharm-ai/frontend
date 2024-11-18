import { mockInstance as instance, setHeaders } from "services/api";

const api = {};

api.fetchRegulationList = (params = {}) =>
  instance.get("/mocks/regulation/prioritization.json", {
    params,
    ...setHeaders(),
  });

api.fetchRegulation = (params = {}) =>
  instance.get(`/mocks/regulation/regulation_${params.id}.json`, {
    params,
    ...setHeaders(),
  });

export default api;
