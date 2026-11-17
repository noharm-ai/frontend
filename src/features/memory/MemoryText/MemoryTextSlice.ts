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

type ThunkConfig = {
  state: { auth: { identify: { access_token?: string } } };
  rejectValue: unknown;
};

// errorHandler (JS) resolves to { status, error } on failure
type ApiResult = { data?: { data?: unknown }; error?: unknown };

const initialState: IMemoryTextState = {
  stores: {},
  reasonText: {
    isFetching: false,
    isSaving: false,
  },
};

const getMemory = async (accessToken: string | undefined, type: string) =>
  (await api.getMemory(accessToken, type).catch(errorHandler)) as ApiResult;

const putMemory = async (
  accessToken: string | undefined,
  params: ISaveMemoryParams,
) =>
  (await api
    .putMemory(accessToken, { ...params, id: params.id })
    .catch(errorHandler)) as ApiResult;

export const fetchMemoryThunk = createAsyncThunk<
  IMemoryRecord[],
  { storeId: string; type: string },
  ThunkConfig
>("memoryText/fetch", async ({ type }, thunkAPI) => {
  const { access_token } = thunkAPI.getState().auth.identify;
  const { data, error } = await getMemory(access_token, type);

  if (!isEmpty(error)) {
    return thunkAPI.rejectWithValue(error);
  }

  return data?.data as IMemoryRecord[];
});

/** Saves a memory record and makes it the only record of its store. */
export const saveMemoryThunk = createAsyncThunk<
  IMemoryRecord,
  { storeId: string; params: ISaveMemoryParams },
  ThunkConfig
>("memoryText/save", async ({ params }, thunkAPI) => {
  const { access_token } = thunkAPI.getState().auth.identify;
  const { data, error } = await putMemory(access_token, params);

  if (!isEmpty(error)) {
    return thunkAPI.rejectWithValue(error);
  }

  return { ...params, key: data?.data as number | string };
});

export const fetchReasonTextThunk = createAsyncThunk<
  IMemoryRecord<{ text: string }>[],
  string,
  ThunkConfig
>("memoryText/fetchReasonText", async (type, thunkAPI) => {
  const { access_token } = thunkAPI.getState().auth.identify;
  const { data, error } = await getMemory(access_token, type);

  if (!isEmpty(error)) {
    return thunkAPI.rejectWithValue(error);
  }

  return data?.data as IMemoryRecord<{ text: string }>[];
});

export const saveReasonTextThunk = createAsyncThunk<
  unknown,
  ISaveMemoryParams,
  ThunkConfig
>("memoryText/saveReasonText", async (params, thunkAPI) => {
  const { access_token } = thunkAPI.getState().auth.identify;
  const { data, error } = await putMemory(access_token, params);

  if (!isEmpty(error)) {
    return thunkAPI.rejectWithValue(error);
  }

  return data?.data;
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
        };
      })
      .addCase(fetchMemoryThunk.fulfilled, (state, action) => {
        state.stores[action.meta.arg.storeId] = {
          isFetching: false,
          list: action.payload,
        };
      })
      .addCase(fetchMemoryThunk.rejected, (state, action) => {
        const store = state.stores[action.meta.arg.storeId];
        if (store) {
          store.isFetching = false;
        }
      })
      .addCase(saveMemoryThunk.fulfilled, (state, action) => {
        const { storeId } = action.meta.arg;
        state.stores[storeId] = {
          isFetching: state.stores[storeId]?.isFetching ?? false,
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
