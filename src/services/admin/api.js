import { instance, setHeaders } from "services/api";

const endpoints = {
  frequency: "/admin/frequency",
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

const api = {
  getFrequencyList,
  updateDailyFrequency,
};

export default api;
