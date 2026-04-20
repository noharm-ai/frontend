import { isEmpty } from "lodash";

import api from "services/api";
import { errorHandler } from "utils";
import { Creators as DrugsCreators } from "./index";

const {
  drugsFetchSummaryStart,
  drugsFetchSummaryError,
  drugsFetchSummarySuccess,

  drugsSearchStart,
  drugsSearchError,
  drugsSearchSuccess,

  drugsUnitsFetchListStart,
  drugsUnitsFetchListError,
  drugsUnitsFetchListSuccess,

  drugsFrequenciesFetchListStart,
  drugsFrequenciesFetchListError,
  drugsFrequenciesFetchListSuccess,
} = DrugsCreators;

export const searchDrugsThunk =
  (idSegment, params = {}) =>
  async (dispatch, getState) => {
    dispatch(drugsSearchStart());

    const { access_token } = getState().auth.identify;
    const { data, error } = await api
      .getDrugsBySegment(access_token, idSegment, params)
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(drugsSearchError(error));
      return;
    }

    const list = data.data;

    dispatch(drugsSearchSuccess(list));
  };

export const fetchDrugsFrequenciesListThunk =
  (params = {}) =>
  async (dispatch, getState) => {
    dispatch(drugsFrequenciesFetchListStart());

    const { access_token } = getState().auth.identify;
    const { data, error } = await api
      .getDrugFrequencies(access_token, params)
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(drugsFrequenciesFetchListError(error));
      return;
    }

    const list = data.data;

    dispatch(drugsFrequenciesFetchListSuccess(list));
  };

export const fetchDrugSummaryThunk =
  (idDrug, idSegment) => async (dispatch, getState) => {
    dispatch(drugsFetchSummaryStart());

    const { access_token } = getState().auth.identify;
    const { data, error } = await api
      .getDrugSummary(access_token, idDrug, idSegment)
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(drugsFetchSummaryError(error));
      return;
    }

    dispatch(drugsFetchSummarySuccess(data.data));
  };

export const fetchDrugResourcesThunk =
  (idDrug, idSegment, idHospital) => async (dispatch, getState) => {
    dispatch(drugsFetchSummaryStart());

    const { access_token } = getState().auth.identify;
    const { data, error } = await api
      .getDrugResources(access_token, idDrug, idSegment, idHospital)
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(drugsFetchSummaryError(error));
      return;
    }

    dispatch(drugsFetchSummarySuccess(data.data));
  };
