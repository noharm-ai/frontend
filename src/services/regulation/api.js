import { instance, setHeaders } from "services/api";

const api = {};
const baseEndpoint = "/regulation";

api.fetchRegulationList = (params = {}) =>
  instance.post(`${baseEndpoint}/prioritization`, params, setHeaders());

api.fetchRegulation = (params = {}) =>
  instance.get(`${baseEndpoint}/view/${params.id}`, {
    ...setHeaders(),
  });

api.fetchTypes = (params = {}) =>
  instance.get(`${baseEndpoint}/types`, {
    params,
    ...setHeaders(),
  });

api.moveRegulation = (params = {}) =>
  instance.post(`${baseEndpoint}/move`, params, setHeaders());

api.createSolicitation = (params = {}) =>
  instance.post(`${baseEndpoint}/create`, params, setHeaders());

export default api;
