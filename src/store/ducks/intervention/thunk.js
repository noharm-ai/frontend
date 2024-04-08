import isEmpty from "lodash.isempty";

import api from "services/api";
import { errorHandler } from "utils";
import { Creators as InterventionCreators } from "./index";

const {
  interventionFetchListStart,
  interventionFetchListError,
  interventionFetchListSuccess,

  interventionFetchReasonsListStart,
  interventionFetchReasonsListError,
  interventionFetchReasonsListSuccess,

  interventionSetSelectedItem,
  interventionUpdateSelectedItemIntervention,

  interventionSetSaveStart,
  interventionSetSaveError,
  interventionSetSaveSuccess,
  interventionClearSavedStatus,

  interventionUpdateList,
  interventionUpdateListStatus,

  interventionFetchFuturePrescriptionStart,
  interventionFetchFuturePrescriptionError,
  interventionFetchFuturePrescriptionSuccess,
} = InterventionCreators;

export const fetchListThunk =
  (params = {}) =>
  async (dispatch, getState) => {
    dispatch(interventionFetchListStart());

    const { access_token } = getState().auth.identify;
    const {
      data: { data },
      error,
    } = await api.getInterventions(access_token, params).catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(interventionFetchListError(error));
      return;
    }

    const list = data;

    dispatch(interventionFetchListSuccess(list));
  };

export const searchListThunk =
  (params = {}) =>
  async (dispatch, getState) => {
    dispatch(interventionFetchListStart());

    const { access_token } = getState().auth.identify;
    const {
      data: { data },
      error,
    } = await api.searchInterventions(access_token, params).catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(interventionFetchListError(error));
      return;
    }

    const list = data;

    dispatch(interventionFetchListSuccess(list));
  };

export const fetchReasonsListThunk =
  (params = {}) =>
  async (dispatch, getState) => {
    if (!isEmpty(getState().intervention.reasons.list)) {
      return;
    }
    dispatch(interventionFetchReasonsListStart());

    const { access_token } = getState().auth.identify;
    const {
      data: { data },
      error,
    } = await api
      .getInterventionReasons(access_token, params)
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(interventionFetchReasonsListError(error));
      return;
    }

    const list = data;

    dispatch(interventionFetchReasonsListSuccess(list));
  };

export const selectItemToSaveThunk = (item) => (dispatch) => {
  dispatch(interventionSetSelectedItem(item));
};

export const updateSelectedItemToSaveInterventionThunk =
  (intervention) => (dispatch) => {
    dispatch(interventionUpdateSelectedItemIntervention(intervention));
  };

export const saveInterventionThunk =
  (params = {}) =>
  async (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      dispatch(interventionSetSaveStart());

      const { access_token } = getState().auth.identify;
      const { status, error, data } = await api
        .updateIntervention(access_token, params)
        .catch(errorHandler);

      if (status !== 200) {
        dispatch(interventionSetSaveError(error));
        reject(error);
        return;
      }

      dispatch(interventionSetSaveSuccess());
      resolve(data);
    });
  };

export const clearSavedInterventionStatusThunk = () => (dispatch) => {
  dispatch(interventionClearSavedStatus());
};

export const updateInterventionListDataThunk = (intervention) => (dispatch) => {
  dispatch(interventionUpdateList(intervention));
};

export const updateInterventionListStatusThunk =
  (idIntervention, status) => (dispatch) => {
    dispatch(interventionUpdateListStatus(idIntervention, status));
  };

export const fetchFuturePrescriptionThunk =
  (id) => async (dispatch, getState) => {
    dispatch(interventionFetchFuturePrescriptionStart());

    const { auth } = getState();
    const { access_token } = auth.identify;
    const {
      data: { data },
      error,
    } = await api
      .getPrescriptionDrugPeriod(access_token, id, { future: 1 })
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(interventionFetchFuturePrescriptionError(error));
      return;
    }

    dispatch(interventionFetchFuturePrescriptionSuccess(id, data));
  };
