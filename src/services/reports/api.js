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

api.live.getExamsRawSearchReport = (params = {}) =>
  instance.get(`/reports/exams/raw`, {
    params,
    ...setHeaders(),
  });

api.live.getPatientObservationHistoryReport = (params = {}) =>
  instance.get(`/patient/${params.admissionNumber}/observation-history`, {
    params: { ...params, admissionNumber: undefined },
    ...setHeaders(),
  });

api.live.getIntegrationNifiLintReport = (params = {}) =>
  instance.get(`/reports/integration/nifilint`, {
    params,
    ...setHeaders(),
  });

// CUSTOM
api.custom = {};

api.custom.getCustomReports = (idReport, filename) =>
  instance.get(`/reports/custom/list`, {
    ...setHeaders(),
  });

api.custom.downloadReport = (idReport, filename) =>
  instance.get(`/reports/custom/download/${idReport}/${filename}`, {
    ...setHeaders(),
  });

api.custom.processReport = (idReport) =>
  instance.get(`/reports/custom/process/${idReport}`, {
    ...setHeaders(),
  });

// REGULATION
api.regulation = {};
api.regulation.getIndicatorsPanel = (params = {}) =>
  instance.post(`/reports/regulation/indicators-panel`, params, setHeaders());

api.regulation.getIndicatorsPanelCsv = (params = {}) =>
  instance.post(`/reports/regulation/indicators-panel-csv`, params, {
    ...setHeaders(),
    responseType: "blob",
  });

api.regulation.getIndicatorsSummary = () =>
  instance.get(`/reports/regulation/indicators-summary`, { ...setHeaders() });

export default api;
