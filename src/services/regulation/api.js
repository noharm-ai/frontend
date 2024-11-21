import { mockInstance, instance, setHeaders } from "services/api";

const api = {};
const baseEndpoint = "/regulation";

api.fetchRegulationList = (params = {}) =>
  instance.post(`${baseEndpoint}/prioritization`, params, setHeaders());

api.fetchRegulation = (params = {}) =>
  mockInstance.get(`/mocks/regulation/regulation_${params.id}.json`, {
    params,
    ...setHeaders(),
  });

api.fetchTypes = (params = {}) =>
  instance.get(`${baseEndpoint}/types`, {
    params,
    ...setHeaders(),
  });

export default api;
