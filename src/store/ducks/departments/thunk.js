// import isEmpty from 'lodash.isempty';

import api from "services/api";
import { errorHandler } from "utils";

import { Creators as DepartmentsCreators } from "./index";

const {
  departmentsFetchListStart,
  // departmentsFetchListError,
  departmentsFetchListSuccess,
} = DepartmentsCreators;

export const fetchDepartmentsListThunk =
  (params = {}) =>
  async (dispatch, getState) => {
    dispatch(departmentsFetchListStart());

    const { access_token } = getState().auth.identify;
    const {
      data: { data: departments },
    } = await api.getFreeDepartments(access_token).catch(errorHandler);

    dispatch(departmentsFetchListSuccess(departments));
  };
