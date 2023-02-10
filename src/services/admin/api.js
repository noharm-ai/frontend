import { instance, setHeaders } from "services/api";

const endpoints = {
  frequency: "/admin/frequency",
  interventionReason: "/admin/intervention-reason",
};

const getFrequencyList = (bearerToken, params = {}) =>
  instance.get(endpoints.frequency, { params, ...setHeaders(bearerToken) });

const updateDailyFrequency = (bearerToken, id, dailyFrequency) => {
  return instance.put(
    `${endpoints.frequency}`,
    {
      id,
      dailyFrequency,
    },
    {
      ...setHeaders(bearerToken),
    }
  );
};

const getIntervReasonList = (bearerToken, params = {}) =>
  instance.get(endpoints.interventionReason, {
    params,
    ...setHeaders(bearerToken),
  });

const api = {
  getFrequencyList,
  updateDailyFrequency,
  getIntervReasonList,
};

export default api;
