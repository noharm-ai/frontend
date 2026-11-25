import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/api";

/**
 * One saved filter. `data` holds the AdvancedFilter values as they were when
 * the filter was saved, so its shape depends on the screen.
 */
export interface ISavedFilter {
  name: string;
  data: Record<string, unknown>;
  active?: boolean;
}

/** The memory record that keeps every saved filter of one type. */
export interface IMemoryFilterRecord {
  value: ISavedFilter[];
  [key: string]: unknown;
}

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

interface IMemoryFilterTypeState {
  status: LoadStatus;
  saveStatus: LoadStatus;
  // empty object until the first fetch answers
  data: IMemoryFilterRecord[] | Record<string, never>;
  error?: string;
}

// keyed by memory type (e.g. intervention_list_<userId>)
type MemoryFilterState = Record<string, IMemoryFilterTypeState>;

interface IFetchFilterResponse {
  data: IMemoryFilterRecord[];
}

interface ISaveFilterParams {
  type: string;
  value: ISavedFilter[];
}

type ThunkConfig = { rejectValue: unknown };

const initialState: MemoryFilterState = {};

const rejectedPayload = (err: unknown) =>
  (err as { response: { data: unknown } }).response.data;

export const fetchFilter = createAsyncThunk<
  IFetchFilterResponse,
  string,
  ThunkConfig
>("memory-filter/get", async (type, thunkAPI) => {
  try {
    const response = await api.getMemory(null, type);

    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(rejectedPayload(err));
  }
});

export const saveFilter = createAsyncThunk<
  unknown,
  ISaveFilterParams,
  ThunkConfig
>("memory-filter/save", async (params, thunkAPI) => {
  try {
    const response = await api.putMemoryUnique(null, params);

    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(rejectedPayload(err));
  }
});

const memoryFilterSlice = createSlice({
  name: "memory-filter",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchFilter.pending, (state, action) => {
        state[action.meta.arg] = {
          ...(state[action.meta.arg] || {
            status: "idle",
            saveStatus: "idle",
            data: {},
          }),
        };
        state[action.meta.arg].status = "loading";
      })
      .addCase(fetchFilter.fulfilled, (state, action) => {
        state[action.meta.arg].status = "succeeded";
        state[action.meta.arg].data = action.payload.data;
      })
      .addCase(fetchFilter.rejected, (state, action) => {
        state[action.meta.arg].status = "failed";
        state[action.meta.arg].error = action.error.message;
      })
      .addCase(saveFilter.pending, (state, action) => {
        if (state[action.meta.arg.type]) {
          state[action.meta.arg.type].status = "loading";
        }
      })
      .addCase(saveFilter.rejected, (state, action) => {
        if (state[action.meta.arg.type]) {
          state[action.meta.arg.type].status = "failed";
        }
      })
      .addCase(saveFilter.fulfilled, (state, action) => {
        if (state[action.meta.arg.type]) {
          state[action.meta.arg.type].status = "succeeded";

          state[action.meta.arg.type].data = [
            {
              value: action.meta.arg.value,
            },
          ];
        }
      });
  },
});

export const { reset } = memoryFilterSlice.actions;

export const memoryFilterReducer = memoryFilterSlice.reducer;
