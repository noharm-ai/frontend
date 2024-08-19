import isEmpty from "lodash.isempty";

import api from "services/api";
import { transformSegments, transformSegment } from "utils/transformers";
import { errorHandler } from "utils";
import { Creators as SegmentsCreators } from "./index";

const {
  segmentsFetchListStart,
  segmentsFetchListError,
  segmentsFetchListSuccess,

  segmentsFetchSingleStart,
  segmentsFetchSingleError,
  segmentsFetchSingleSuccess,
  segmentsFetchSingleReset,
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

export const fetchSegmentByIdThunk =
  (id, idHospital) => async (dispatch, getState) => {
    dispatch(segmentsFetchSingleStart());

    const { access_token } = getState().auth.identify;
    const { data, error } = await api
      .getSegmentById(access_token, id, idHospital)
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(segmentsFetchSingleError(error));
      return;
    }

    const single = transformSegment(data.data);

    dispatch(
      segmentsFetchSingleSuccess(single, { idSegment: parseInt(id, 10) })
    );
  };

export const resetSingleSegmentThunk = () => async (dispatch, getState) => {
  dispatch(segmentsFetchSingleReset());
};
