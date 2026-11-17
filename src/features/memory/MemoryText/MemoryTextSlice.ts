import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isEmpty } from "lodash";

import api from "services/api";
import { errorHandler } from "utils/index";

/**
 * A memory record as the backend returns it (GET /memory/:type). `value`
 * depends on the memory type: a list of named texts for the clinical note
 * texts, a list of named filters for the saved filters, `{ text }` for the
 * default text of an intervention reason.
 */
export interface IMemoryRecord<TValue = unknown> {
  key: number | string;
  type?: string;
  value: TValue;
  [key: string]: unknown;
}

/** One loaded memory type, kept under the storeId its reader chose. */
export interface IMemoryStore<TValue = unknown> {
  isFetching: boolean;
  list: IMemoryRecord<TValue>[];
  // the fetch whose answer is still awaited: an answer from an older fetch,
  // or one that arrives after a save, is stale and ignored
  fetchRequestId?: string | null;
}

interface IMemoryTextState {
  stores: Record<string, IMemoryStore>;
  // the default text of an intervention reason: read and written one reason
  // at a time, so only the request state is kept
  reasonText: {
    isFetching: boolean;
    isSaving: boolean;
  };
}

export interface ISaveMemoryParams {
  id?: number | string | null;
  type: string;
  value: unknown;
}

type ThunkConfig = { rejectValue: unknown };

// errorHandler (JS) resolves to { error } on failure. services/api builds the
// auth header from localStorage, so no token is passed
type ApiResult = { data?: { data?: unknown }; error?: unknown };

const initialState: IMemoryTextState = {
  stores: {},
  reasonText: {
    isFetching: false,
    isSaving: false,
  },
};

const requestMemory = async (type: string) => {
  const { data, error } = (await api
    .getMemory(null, type)
    .catch(errorHandler)) as ApiResult;

  return { records: (data?.data ?? []) as IMemoryRecord[], error };
};

const requestSaveMemory = async (params: ISaveMemoryParams) => {
  const { data, error } = (await api
    .putMemory(null, { ...params, id: params.id })
    .catch(errorHandler)) as ApiResult;

  // PUT /memory answers with the key of the saved record
  return { key: data?.data as number | string, error };
};

export const fetchMemoryThunk = createAsyncThunk<
  IMemoryRecord[],
  { storeId: string; type: string },
  ThunkConfig
>("memoryText/fetch", async ({ type }, thunkAPI) => {
  const { records, error } = await requestMemory(type);

  return isEmpty(error) ? records : thunkAPI.rejectWithValue(error);
});

/** Saves a memory record and makes it the only record of its store. */
export const saveMemoryThunk = createAsyncThunk<
  IMemoryRecord,
  { storeId: string; params: ISaveMemoryParams },
  ThunkConfig
>("memoryText/save", async ({ params }, thunkAPI) => {
  const { key, error } = await requestSaveMemory(params);

  return isEmpty(error) ? { ...params, key } : thunkAPI.rejectWithValue(error);
});

export const fetchReasonTextThunk = createAsyncThunk<
  IMemoryRecord<{ text: string }>[],
  string,
  ThunkConfig
>("memoryText/fetchReasonText", async (type, thunkAPI) => {
  const { records, error } = await requestMemory(type);

  return isEmpty(error)
    ? (records as IMemoryRecord<{ text: string }>[])
    : thunkAPI.rejectWithValue(error);
});

export const saveReasonTextThunk = createAsyncThunk<
  number | string,
  ISaveMemoryParams,
  ThunkConfig
>("memoryText/saveReasonText", async (params, thunkAPI) => {
  const { key, error } = await requestSaveMemory(params);

  return isEmpty(error) ? key : thunkAPI.rejectWithValue(error);
});

const memoryTextSlice = createSlice({
  name: "memoryText",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchMemoryThunk.pending, (state, action) => {
        const { storeId } = action.meta.arg;
        state.stores[storeId] = {
          list: state.stores[storeId]?.list ?? [],
          isFetching: true,
          fetchRequestId: action.meta.requestId,
        };
      })
      .addCase(fetchMemoryThunk.fulfilled, (state, action) => {
        const store = state.stores[action.meta.arg.storeId];
        if (store?.fetchRequestId !== action.meta.requestId) return;

        store.isFetching = false;
        store.fetchRequestId = null;
        store.list = action.payload;
      })
      .addCase(fetchMemoryThunk.rejected, (state, action) => {
        const store = state.stores[action.meta.arg.storeId];
        if (store?.fetchRequestId !== action.meta.requestId) return;

        store.isFetching = false;
        store.fetchRequestId = null;
      })
      .addCase(saveMemoryThunk.fulfilled, (state, action) => {
        const { storeId } = action.meta.arg;
        // the saved record is newer than any fetch still in flight
        state.stores[storeId] = {
          isFetching: false,
          fetchRequestId: null,
          list: [action.payload],
        };
      })
      .addCase(fetchReasonTextThunk.pending, (state) => {
        state.reasonText.isFetching = true;
      })
      .addCase(fetchReasonTextThunk.fulfilled, (state) => {
        state.reasonText.isFetching = false;
      })
      .addCase(fetchReasonTextThunk.rejected, (state) => {
        state.reasonText.isFetching = false;
      })
      .addCase(saveReasonTextThunk.pending, (state) => {
        state.reasonText.isSaving = true;
      })
      .addCase(saveReasonTextThunk.fulfilled, (state) => {
        state.reasonText.isSaving = false;
      })
      .addCase(saveReasonTextThunk.rejected, (state) => {
        state.reasonText.isSaving = false;
      });
  },
});

export const { reset } = memoryTextSlice.actions;

export const memoryTextReducer = memoryTextSlice.reducer;
