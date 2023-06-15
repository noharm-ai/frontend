import isEmpty from "lodash.isempty";

import api from "services/api";
import { transformSegments } from "utils/transformers";
import { errorHandler } from "utils";
import { Creators as DrugsCreators } from "../drugs";
import { Creators as SegmentsCreators } from "../segments";
import { Creators as OutliersCreators } from "./index";

const {
  outliersGenerateStop,
  outliersResetGenerate,
  outliersGenerateStart,

  outliersGenerateDrugStart,
  outliersGenerateDrugError,
  outliersGenerateDrugSuccess,
  outliersGenerateDrugReset,

  outliersFetchListStart,
  outliersFetchListError,
  outliersFetchListSuccess,

  outliersFetchSubstanceListStart,
  outliersFetchSubstanceListError,
  outliersFetchSubstanceListSuccess,

  outliersFetchSubstanceSingleStart,
  outliersFetchSubstanceSingleError,
  outliersFetchSubstanceSingleSuccess,

  outliersSaveStart,
  outliersSaveSuccess,
  outliersSaveReset,
  outliersSaveError,

  outliersSetSelectedItem,
  outliersUpdateSelectedItem,

  outliersSelectRelation,
  outliersUpdateRelation,
  outliersSaveRelationStart,
  outliersSaveRelationSuccess,
  outliersSaveRelationReset,
  outliersSaveRelationError,

  outliersUpdateDrugData,

  outliersSelectSubstance,
  outliersUpdateSubstance,
  outliersSaveSubstanceStart,
  outliersSaveSubstanceSuccess,
  outliersSaveSubstanceReset,
  outliersSaveSubstanceError,

  outliersFetchRelationStart,
  outliersFetchRelationError,
  outliersFetchRelationSuccess,
} = OutliersCreators;

const { drugsFetchListStart, drugsFetchListError, drugsFetchListSuccess } =
  DrugsCreators;
const {
  segmentsFetchListStart,
  segmentsFetchListError,
  segmentsFetchListSuccess,
} = SegmentsCreators;

export const generateOutlierThunk =
  ({ id: idSegment, nameSegment }) =>
  async (dispatch, getState) => {
    dispatch(outliersGenerateStart({ idSegment, nameSegment }));

    const { access_token } = getState().auth.identify;
    const {
      status,
      data: { data },
    } = await api.generateOutlier(access_token, idSegment);

    dispatch(outliersGenerateStop(status, data));
  };

export const generateDrugOutlierThunk =
  (params) => async (dispatch, getState) => {
    dispatch(outliersGenerateDrugStart());

    const { access_token } = getState().auth.identify;
    const {
      data: { data },
      error,
    } = await api.generateDrugOutlier(access_token, params).catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(outliersGenerateDrugError(error));
      return;
    }

    dispatch(outliersGenerateDrugSuccess(data));
  };

export const resetGenerateThunk = () => (dispatch) => {
  dispatch(outliersResetGenerate());
};

export const resetGenerateDrugOutlierThunk = () => (dispatch) => {
  dispatch(outliersGenerateDrugReset());
};

export const fetchOutliersListThunk =
  (params = {}) =>
  async (dispatch, getState) => {
    dispatch(outliersFetchListStart());
    const { idSegment, idDrug } = params;

    if (!idSegment || !idDrug) {
      dispatch(outliersFetchListError({}));
      return;
    }

    const { access_token } = getState().auth.identify;
    const {
      data: { data },
      error,
    } = await api.getOutliersBySegmentAndDrug(access_token, params);

    if (!isEmpty(error)) {
      dispatch(outliersFetchListError(error));
      return;
    }

    const { list: drugs } = getState().drugs;
    const [drug] = drugs.filter(
      ({ idDrug }) => `${idDrug}` === `${params.idDrug}`
    );
    const list = data.map((item) => ({ ...item, ...drug }));

    dispatch(outliersFetchListSuccess(list, params));
  };

export const saveOutlierThunk =
  (idOutlier, params = {}) =>
  (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      if (!idOutlier) {
        return;
      }

      dispatch(outliersSaveStart());
      const { access_token } = getState().auth.identify;
      const { status, error } = await api.updateOutlier(
        access_token,
        idOutlier,
        params
      );

      if (status !== 200) {
        dispatch(outliersSaveError(error));
        reject(error);
        return;
      }

      dispatch(outliersSaveSuccess(idOutlier, params));
      dispatch(outliersSaveReset());
      resolve(params);
    });
  };

export const fetchReferencesListThunk =
  (idSegment, idDrug, dose, frequency) => async (dispatch, getState) => {
    dispatch(drugsFetchListStart());
    dispatch(segmentsFetchListStart());
    dispatch(outliersFetchListStart());

    const { access_token } = getState().auth.identify;

    // get drugs list
    if (idSegment == null) {
      idSegment = 1;
    }
    const { data: drugsData, error: drugsError } = await api
      .getDrugsBySegment(access_token, idSegment)
      .catch(errorHandler);

    if (!isEmpty(drugsError)) {
      dispatch(drugsFetchListError(drugsError));
      return;
    }

    const drugsList = drugsData.data;

    dispatch(drugsFetchListSuccess(drugsList));

    // get segments list
    const { data: segmentsData, error: segmentsError } = await api
      .getSegments(access_token)
      .catch(errorHandler);

    if (!isEmpty(segmentsError)) {
      dispatch(segmentsFetchListError(segmentsError));
      return;
    }

    const segmentsList = transformSegments(segmentsData.data);

    dispatch(segmentsFetchListSuccess(segmentsList));

    // get outliers list
    let drug;
    let params;

    if (idDrug != null) {
      params = {
        idDrug: parseInt(idDrug, 10),
        idSegment: parseInt(idSegment, 10),
      };
      drug = drugsList.find((item) => `${item.idDrug}` === `${params.idDrug}`);
    } else {
      const [segment] = segmentsList;
      drug = drugsList[0];

      params = {
        idDrug: drug.idDrug,
        idSegment: idSegment ? idSegment : segment.id,
      };
    }

    if (dose != null && frequency != null) {
      params.d = dose;
      params.f = frequency;
    }

    const {
      data: { data },
      error,
    } = await api.getOutliersBySegmentAndDrug(access_token, params);

    if (!isEmpty(error)) {
      dispatch(outliersFetchListError(error));
      return;
    }

    const { outliers } = data;
    const list = outliers.map((item) => ({
      ...item,
      ...drug,
      ...data,
    }));
    const drugData = data;
    delete drugData.outliers;

    dispatch(outliersFetchListSuccess(list, drugData, params));
  };

export const selectItemToSaveThunk = (item) => (dispatch) => {
  dispatch(outliersSetSelectedItem(item));
};

export const updateSelectedItemToSaveOutlierThunk = (item) => (dispatch) => {
  dispatch(outliersUpdateSelectedItem(item));
};

export const selectOutlierRelationThunk = (item) => (dispatch) => {
  dispatch(outliersSelectRelation(item));
};

export const updateOutlierRelationThunk = (item) => (dispatch) => {
  dispatch(outliersUpdateRelation(item));
};

export const saveOutlierRelationThunk =
  (params = {}) =>
  (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      dispatch(outliersSaveRelationStart());
      const { access_token } = getState().auth.identify;
      const { status, error } = await api.updateOutlierRelation(
        access_token,
        params
      );

      if (status !== 200) {
        dispatch(outliersSaveRelationError(error));
        reject(error);
        return;
      }

      dispatch(outliersSaveRelationSuccess(params));
      dispatch(outliersSaveRelationReset());
      resolve(params);
    });
  };

export const fetchSubstanceListThunk =
  (params = {}) =>
  async (dispatch, getState) => {
    if (!isEmpty(getState().outliers.substance.list)) {
      return;
    }
    dispatch(outliersFetchSubstanceListStart());

    const { access_token } = getState().auth.identify;
    const {
      data: { data },
      error,
    } = await api.getSubstances(access_token, params).catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(outliersFetchSubstanceListError(error));
      return;
    }

    const list = data;

    dispatch(outliersFetchSubstanceListSuccess(list));
  };

export const fetchSubstanceSingleThunk = (id) => async (dispatch, getState) => {
  dispatch(outliersFetchSubstanceSingleStart());

  const { access_token } = getState().auth.identify;
  const {
    data: { data },
    error,
  } = await api.getSubstanceSingle(access_token, id).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(outliersFetchSubstanceSingleError(error));
    return;
  }
  dispatch(outliersFetchSubstanceSingleSuccess(data));
};

export const updateDrugDataThunk = (item) => (dispatch) => {
  dispatch(outliersUpdateDrugData(item));
};

/**
 * Substances
 */

export const selectOutlierSubstanceThunk = (item) => (dispatch) => {
  dispatch(outliersSelectSubstance(item));
};

export const updateOutlierSubstanceThunk = (item) => (dispatch) => {
  dispatch(outliersUpdateSubstance(item));
};

export const saveOutlierSubstanceThunk =
  (params = {}) =>
  (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      dispatch(outliersSaveSubstanceStart());
      const { access_token } = getState().auth.identify;
      const { status, error } = await api.updateSubstance(access_token, params);

      if (status !== 200) {
        dispatch(outliersSaveSubstanceError(error));
        reject(error);
        return;
      }

      const { isAdd } = params;
      delete params.isAdd;

      dispatch(outliersSaveSubstanceSuccess(params));
      dispatch(outliersSaveSubstanceReset());

      if (!isAdd) {
        dispatch(
          outliersUpdateDrugData({
            sctidA: params.sctid,
            sctNameA: params.name,
          })
        );
      }

      resolve();
    });
  };

export const fetchRelationListThunk =
  (id, params = {}) =>
  async (dispatch, getState) => {
    dispatch(outliersFetchRelationStart());

    const { access_token } = getState().auth.identify;
    const {
      data: { data },
      error,
    } = await api
      .getSubstanceRelations(access_token, id, params)
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(outliersFetchRelationError(error));
      return;
    }

    dispatch(outliersFetchRelationSuccess(data));
  };
