import { instance, setHeaders } from "services/api";

const api = {};
const endpoints = {
  drug: "/admin/drug",
  integration: "/admin/integration",
  exam: "/admin/exam",
};

const refreshPrescription = (params = {}) => {
  return instance.post(
    `${endpoints.integration}/refresh-prescription`,
    params,
    {
      ...setHeaders(),
    },
  );
};

/**
 * EXAMS
 */

api.exams = {};
api.exams.copyExams = (params) =>
  instance.post(`${endpoints.exam}/copy`, params, {
    ...setHeaders(),
  });

api.exams.getMostFrequentExams = (params) =>
  instance.get(`${endpoints.exam}/most-frequent`, {
    params,
    ...setHeaders(),
  });

api.exams.getExamTypes = (params) =>
  instance.get(`${endpoints.exam}/types`, {
    params,
    ...setHeaders(),
  });

api.exams.getGlobalExams = (params) =>
  instance.get(`${endpoints.exam}/list-global`, {
    params,
    ...setHeaders(),
  });

api.exams.addMostFrequentExams = (params) =>
  instance.post(`${endpoints.exam}/most-frequent/add`, params, {
    ...setHeaders(),
  });

api.exams.listExams = (params) =>
  instance.post(`${endpoints.exam}/list`, params, {
    ...setHeaders(),
  });

api.exams.upsertExam = (params) =>
  instance.post(`${endpoints.exam}/upsert`, params, {
    ...setHeaders(),
  });

api.exams.setExamsOrder = (params) =>
  instance.post(`${endpoints.exam}/order`, params, {
    ...setHeaders(),
  });

api.exams.getExam = (params) =>
  instance.post(`${endpoints.exam}/get`, params, {
    ...setHeaders(),
  });

/**
 * DRUGS
 */

api.drugs = {};
api.drugs.getDrugRef = (params) =>
  instance.get(`${endpoints.drug}/ref`, {
    params,
    ...setHeaders(),
  });

/**
 * INTEGRATION
 */

api.integration = {};
api.integration.updateUserSecurityGroup = (params) =>
  instance.post(`${endpoints.integration}/update-user-security-group`, params, {
    ...setHeaders(),
  });

/**
 * User
 */
api.user = {};
api.user.getResetToken = (params) =>
  instance.post(`/user/reset-token`, params, {
    ...setHeaders(),
  });
api.user.sendResetPasswordEmail = (params) =>
  instance.post(`/user-admin/send-reset-email`, params, {
    ...setHeaders(),
  });
api.user.getResetPasswordHistory = (idUser) =>
  instance.get(`/user-admin/reset-history/${idUser}`, {
    ...setHeaders(),
  });

/**
 * SUBSTANCE
 */

api.substance = {};
api.substance.getSubstance = (id) => {
  return instance.get(`/admin/substance/${id}`, {
    ...setHeaders(),
  });
};

/**
 * TAGS
 */
api.tag = {};
api.tag.getTags = (params = {}) =>
  instance.post(`/admin/tag/list`, params, setHeaders());

api.tag.upsertTag = (params = {}) => {
  return instance.post(`/admin/tag/upsert`, params, {
    ...setHeaders(),
  });
};

/**
 * PROTOCOLS
 */
api.protocols = {};
api.protocols.getProtocols = (params = {}) =>
  instance.post(`/admin/protocol/list`, params, setHeaders());

api.protocols.getProtocol = (id, params = {}) =>
  instance.get(`/admin/protocol/${id}`, {
    params,
    ...setHeaders(),
  });

api.protocols.upsertProtocol = (params = {}) => {
  return instance.post(`/admin/protocol/upsert`, params, {
    ...setHeaders(),
  });
};

api.protocols.getDepartments = (params = {}) =>
  instance.get(`/admin/protocol/department/list`, {
    params,
    ...setHeaders(),
  });

const methods = {
  ...api,
  refreshPrescription,
};

export default methods;
