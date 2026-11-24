import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isEmpty } from "lodash";

import api from "services/api";
import { errorHandler } from "utils/index";

/**
 * Shared drug lookups: the drug search (prioritization filter, drug dashboard,
 * intervention and prescription drug forms), the frequency list
 * (prioritization filter) and the summary of one drug (intervention
 * transcription and prescription drug form).
 */

export interface IDrugOption {
  idDrug: number;
  name: string;
  [key: string]: unknown;
}

export interface IFrequencyOption {
  id: number | string;
  description: string;
  [key: string]: unknown;
}

interface IDrugSummaryOption {
  id: number | string;
  description: string;
}

export interface IDrugSummary {
  drug?: { id: number | string; name: string };
  units?: IDrugSummaryOption[];
  routes?: IDrugSummaryOption[];
  frequencies?: IDrugSummaryOption[];
  removeFields?: string[];
  [key: string]: unknown;
}

// the backend error payload is not typed
type DrugsError = unknown;

interface IDrugsSlice {
  search: {
    isFetching: boolean;
    error: DrugsError;
    list: IDrugOption[];
  };
  frequencies: {
    isFetching: boolean;
    error: DrugsError;
    list: IFrequencyOption[];
  };
  summary: {
    isFetching: boolean;
    error: DrugsError;
    data: IDrugSummary | null;
  };
}

const initialState: IDrugsSlice = {
  search: {
    isFetching: false,
    error: null,
    list: [],
  },
  frequencies: {
    isFetching: false,
    error: null,
    list: [],
  },
  summary: {
    isFetching: false,
    error: null,
    data: null,
  },
};

interface IThunkConfig {
  state: { auth: { identify: { access_token?: string } } };
  rejectValue: DrugsError;
}

interface IApiResult<T> {
  data: { data: T };
  error?: DrugsError;
}

export interface ISearchDrugsParams {
  idSegment?: number | string | null;
  params?: Record<string, unknown>;
}

export const searchDrugs = createAsyncThunk<
  IDrugOption[],
  ISearchDrugsParams,
  IThunkConfig
>("drugs/search", async ({ idSegment, params = {} }, thunkAPI) => {
  const { access_token } = thunkAPI.getState().auth.identify;
  const { data, error } = (await api
    .getDrugsBySegment(access_token, idSegment, params)
    .catch(errorHandler)) as IApiResult<IDrugOption[]>;

  if (!isEmpty(error)) {
    return thunkAPI.rejectWithValue(error);
  }

  return data.data;
});

export const fetchDrugFrequencies = createAsyncThunk<
  IFrequencyOption[],
  Record<string, unknown> | void,
  IThunkConfig
>("drugs/fetch-frequencies", async (params, thunkAPI) => {
  const { access_token } = thunkAPI.getState().auth.identify;
  const { data, error } = (await api
    .getDrugFrequencies(access_token, params ?? {})
    .catch(errorHandler)) as IApiResult<IFrequencyOption[]>;

  if (!isEmpty(error)) {
    return thunkAPI.rejectWithValue(error);
  }

  return data.data;
});

export const fetchDrugSummary = createAsyncThunk<
  IDrugSummary,
  { idDrug: number | string; idSegment?: number | string | null },
  IThunkConfig
>("drugs/fetch-summary", async ({ idDrug, idSegment }, thunkAPI) => {
  const { access_token } = thunkAPI.getState().auth.identify;
  const { data, error } = (await api
    .getDrugSummary(access_token, idDrug, idSegment)
    .catch(errorHandler)) as IApiResult<IDrugSummary>;

  if (!isEmpty(error)) {
    return thunkAPI.rejectWithValue(error);
  }

  return data.data;
});

// same summary state as fetchDrugSummary, from the resources endpoint
export const fetchDrugResources = createAsyncThunk<
  IDrugSummary,
  {
    idDrug: number | string;
    idSegment?: number | string | null;
    idHospital?: number | string | null;
  },
  IThunkConfig
>(
  "drugs/fetch-resources",
  async ({ idDrug, idSegment, idHospital }, thunkAPI) => {
    const { access_token } = thunkAPI.getState().auth.identify;
    const { data, error } = (await api
      .getDrugResources(access_token, idDrug, idSegment, idHospital)
      .catch(errorHandler)) as IApiResult<IDrugSummary>;

    if (!isEmpty(error)) {
      return thunkAPI.rejectWithValue(error);
    }

    return data.data;
  },
);

const drugsSlice = createSlice({
  name: "drugs",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchDrugs.pending, (state) => {
        state.search.isFetching = true;
      })
      .addCase(searchDrugs.fulfilled, (state, action) => {
        state.search.list = action.payload;
        state.search.error = null;
        state.search.isFetching = false;
      })
      .addCase(searchDrugs.rejected, (state, action) => {
        state.search.error = action.payload;
        state.search.isFetching = false;
      })
      .addCase(fetchDrugFrequencies.pending, (state) => {
        state.frequencies.isFetching = true;
      })
      .addCase(fetchDrugFrequencies.fulfilled, (state, action) => {
        state.frequencies.list = action.payload;
        state.frequencies.error = null;
        state.frequencies.isFetching = false;
      })
      .addCase(fetchDrugFrequencies.rejected, (state, action) => {
        state.frequencies.error = action.payload;
        state.frequencies.isFetching = false;
      });

    for (const thunk of [fetchDrugSummary, fetchDrugResources]) {
      builder
        .addCase(thunk.pending, (state) => {
          state.summary.isFetching = true;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.summary.data = action.payload;
          state.summary.error = null;
          state.summary.isFetching = false;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.summary.error = action.payload;
          state.summary.isFetching = false;
        });
    }
  },
});

export const { reset } = drugsSlice.actions;

export const drugsReducer = drugsSlice.reducer;
