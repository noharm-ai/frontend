import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { isEmpty } from "lodash";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";

import api from "services/api";
import { transformSegments } from "utils/transformers";
import { errorHandler } from "utils/index";

// shape produced by utils/transformers/segments (transformSegment)
export interface ISegment {
  id: number | string;
  description: string;
  minAge?: number | null;
  maxAge?: number | null;
  minWeight?: number | null;
  maxWeight?: number | null;
  minMaxAge?: string;
  minMaxWeight?: string;
  slug?: string;
  [key: string]: unknown;
}

// the backend error payload is not typed
type SegmentsError = unknown;

interface ISegmentsSlice {
  error: SegmentsError;
  isFetching: boolean;
  list: ISegment[];
  firstFilter: {
    idSegment: number | string | undefined;
  };
  single: {
    error: SegmentsError;
    isFetching: boolean;
    content: Record<string, unknown>;
  };
}

interface IFetchSegmentsParams {
  clearCache?: boolean;
  [key: string]: unknown;
}

const initialState: ISegmentsSlice = {
  error: null,
  isFetching: false,
  list: [],
  firstFilter: {
    idSegment: undefined,
  },
  single: {
    error: null,
    isFetching: false,
    content: {},
  },
};

export const fetchSegmentsListThunk = createAsyncThunk<
  ISegment[],
  IFetchSegmentsParams | void,
  {
    state: {
      segments: ISegmentsSlice;
      auth: { identify: { access_token?: string } };
    };
    rejectValue: SegmentsError;
  }
>(
  "segments/fetch-list",
  async (params, thunkAPI) => {
    const { access_token } = thunkAPI.getState().auth.identify;

    const { data, error } = (await api
      .getSegments(access_token, params ?? {})
      .catch(errorHandler)) as {
      data: { data: Parameters<typeof transformSegments>[0] };
      error?: SegmentsError;
    };

    if (!isEmpty(error)) {
      return thunkAPI.rejectWithValue(error);
    }

    return transformSegments(data.data) as ISegment[];
  },
  {
    // list already loaded: skip the request unless a refresh is asked
    condition: (params, { getState }) =>
      !!params?.clearCache || !getState().segments.list.length,
  },
);

const segmentsSlice = createSlice({
  name: "segments",
  initialState,
  reducers: {
    segmentsFetchListSuccess(state, action: PayloadAction<ISegment[]>) {
      state.list = action.payload;
      state.error = null;
      state.isFetching = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSegmentsListThunk.pending, (state) => {
        state.isFetching = true;
      })
      .addCase(fetchSegmentsListThunk.fulfilled, (state, action) => {
        state.list = action.payload;
        state.error = null;
        state.isFetching = false;
      })
      .addCase(fetchSegmentsListThunk.rejected, (state, action) => {
        state.error = action.payload;
        state.isFetching = false;
      });
  },
});

export const { segmentsFetchListSuccess } = segmentsSlice.actions;

const persistConfig = {
  key: "segments",
  storage,
  whitelist: ["list"],
  stateReconciler: autoMergeLevel2,
};

export const segmentsReducer = persistReducer<ISegmentsSlice>(
  persistConfig,
  segmentsSlice.reducer,
);
