import { instance, setHeaders } from "services/api";

const api = {};

api.fetchRegulationList = (params = {}) =>
  instance.get("http://localhost:3000/mocks/regulation/prioritization.json", {
    params,
    ...setHeaders(),
  });

export default api;
