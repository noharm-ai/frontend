import { instance, setHeaders } from "services/api";

const api: any = {};
const baseEndpoint = "/regulation";

api.fetchRegulationList = (params = {}) =>
  instance.post(`${baseEndpoint}/prioritization`, params, setHeaders());

api.fetchRegulation = (params: any = {}) =>
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

export interface IAttributeCreate {
  idRegSolicitation: number;
  tpAttribute: number;
  tpStatus: number;
  value: any;
}

api.fetchSolicitationAttributes = (params: {
  idRegSolicitation: number;
  tpAttribute: number;
}) =>
  instance.get(`${baseEndpoint}/attribute/list`, {
    params,
    ...setHeaders(),
  });

api.createSolicitationAttribute = (params: IAttributeCreate) =>
  instance.post(`${baseEndpoint}/attribute/create`, params, setHeaders());

api.removeSolicitationAttribute = (params: { id: number }) =>
  instance.post(
    `${baseEndpoint}/attribute/remove/${params.id}`,
    params,
    setHeaders()
  );

export default api;
