import isEmpty from "lodash.isempty";

import api from "services/api";
import { transformSegments } from "utils/transformers";
import { errorHandler } from "utils";
import { Creators as SegmentsCreators } from "./index";

const {
  segmentsFetchListStart,
  segmentsFetchListError,
  segmentsFetchListSuccess,
} = SegmentsCreators;

export const fetchSegmentsListThunk =
  (params = {}) =>
  async (dispatch, getState) => {
    if (!params.clearCache && getState().segments.list.length) return;

    dispatch(segmentsFetchListStart());

    const { access_token } = getState().auth.identify;

    const { data, error } = await api
      .getSegments(access_token, params)
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(segmentsFetchListError(error));
      return;
    }

    const list = transformSegments(data.data);

    dispatch(segmentsFetchListSuccess(list));
  };
