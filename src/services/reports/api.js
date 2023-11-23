import { instance, setHeaders } from "services/api";

const endpoints = {
  general: "/reports/general",
};

const getGeneralPrescription = (params = {}) =>
  instance.get(`${endpoints.general}/prescription`, {
    params,
    ...setHeaders(),
  });

const api = {
  getGeneralPrescription,
};

export default api;
