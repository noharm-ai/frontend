import isEmpty from "lodash.isempty";
import { arrayMoveImmutable } from "array-move";

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

  segmentsSelectExam,
  segmentsUpdateExam,
  segmentsSaveExamStart,
  segmentsSaveExamSuccess,
  segmentsSaveExamReset,
  segmentsSaveExamError,

  segmentsFetchExamTypesListStart,
  segmentsFetchExamTypesListError,
  segmentsFetchExamTypesListSuccess,

  segmentsUpdateExamOrderStart,
  segmentsUpdateExamOrderError,
  segmentsUpdateExamOrderSuccess,
  segmentsUpdateExamOrderReset,
} = SegmentsCreators;

export const fetchSegmentsListThunk =
  (params = {}) =>
  async (dispatch, getState) => {
    if (getState().segments.list.length) return;

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

export const selectSegmentExamThunk = (item) => (dispatch) => {
  dispatch(segmentsSelectExam(item));
};

export const updateSegmentExamThunk = (item) => (dispatch) => {
  dispatch(segmentsUpdateExam(item));
};

export const updateSegmentExamOrderThunk =
  (oldIndex, newIndex) => async (dispatch, getState) => {
    const currentExamsOrder = getState().segments.single.content.exams;
    const exams = arrayMoveImmutable(
      [...getState().segments.single.content.exams],
      oldIndex,
      newIndex
    );
    dispatch(segmentsUpdateExamOrderSuccess(exams));

    dispatch(segmentsUpdateExamOrderStart());

    const { access_token } = getState().auth.identify;
    const examTypes = exams.map((e) => e.type);
    const { status, error } = await api.updateSegmentExamOrder(
      access_token,
      getState().segments.firstFilter.idSegment,
      {
        exams: examTypes,
      }
    );

    if (status !== 200) {
      dispatch(segmentsUpdateExamOrderSuccess(currentExamsOrder));
      dispatch(segmentsUpdateExamOrderError(error));
      return;
    }

    dispatch(segmentsUpdateExamOrderReset());
  };

export const saveSegmentExamThunk =
  (params = {}) =>
  async (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      dispatch(segmentsSaveExamStart());
      const { access_token } = getState().auth.identify;
      const { status, error } = await api.updateSegmentExam(
        access_token,
        params
      );

      if (status !== 200) {
        dispatch(segmentsSaveExamError(error));
        reject(error);
        return;
      }

      dispatch(segmentsSaveExamSuccess(params));
      dispatch(segmentsSaveExamReset());
      resolve(params);
    });
  };

export const fetchExamTypesListThunk =
  (params = {}) =>
  async (dispatch, getState) => {
    if (!isEmpty(getState().segments.examTypes.list)) {
      return;
    }
    dispatch(segmentsFetchExamTypesListStart());

    const { access_token } = getState().auth.identify;
    const {
      data: { data },
      error,
    } = await api.getExamTypes(access_token, params).catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(segmentsFetchExamTypesListError(error));
      return;
    }

    const list = data;

    dispatch(segmentsFetchExamTypesListSuccess(list.types));
  };
