import { isEmpty } from "lodash";

import api from "services/api";
import { errorHandler } from "utils";
import { Creators as ReportsCreators } from "./index";

const {
  memoryFetchStart,
  memoryFetchError,
  memoryFetchSuccess,

  memorySaveStart,
  memorySaveError,
  memorySaveSuccess,
  memorySaveReset,

  memoryFetchReasonTextStart,
  memoryFetchReasonTextError,
  memoryFetchReasonTextSuccess,

  memorySaveReasonTextStart,
  memorySaveReasonTextError,
  memorySaveReasonTextSuccess,
  memorySaveReasonTextReset,
} = ReportsCreators;

export const memoryFetchThunk =
  (storeId, type) => async (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      dispatch(memoryFetchStart(storeId));

      const { access_token } = getState().auth.identify;

      const { data, error } = await api
        .getMemory(access_token, type)
        .catch(errorHandler);

      if (!isEmpty(error)) {
        dispatch(memoryFetchError(storeId, error));
        reject(error);
        return;
      }

      dispatch(memoryFetchSuccess(storeId, data.data));
      resolve(data);
    });
  };

export const memoryFetchReasonTextThunk =
  (type) => async (dispatch, getState) => {
    dispatch(memoryFetchReasonTextStart());

    const { access_token } = getState().auth.identify;

    const { data, error } = await api
      .getMemory(access_token, type)
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(memoryFetchReasonTextError(error));
      return;
    }

    dispatch(memoryFetchReasonTextSuccess(data.data));
  };

export const memorySaveReasonTextThunk =
  (params) => async (dispatch, getState) => {
    dispatch(memorySaveReasonTextStart());

    const { access_token } = getState().auth.identify;

    const { data, error } = await api
      .putMemory(access_token, params)
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(memorySaveReasonTextError(error));
      return;
    }

    dispatch(memorySaveReasonTextSuccess({ ...params, key: data.data }));
    dispatch(memorySaveReasonTextReset());
  };

export const memorySaveThunk =
  (storeId, params) => async (dispatch, getState) => {
    dispatch(memorySaveStart(storeId));

    const { access_token } = getState().auth.identify;

    const { data, error } = await api
      .putMemory(access_token, params)
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(memorySaveError(storeId, error));
      return;
    }

    dispatch(memorySaveSuccess(storeId, { ...params, key: data.data }));
    dispatch(memorySaveReset(storeId));
  };
