import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";

const initialState = {
  list: [],
  status: "idle",
  error: null,
  single: {
    data: null,
    status: "idle",
    error: null,
  },
  initInterventionReason: {
    status: "idle",
    error: null,
  },
};

export const fetchInterventionReasons = createAsyncThunk(
  "intervention-reason/fetch",
  async (params, thunkAPI) => {
    const { access_token } = thunkAPI.getState().auth.identify;

    const response = await api.getIntervReasonList(access_token);
    return response.data;
  }
);

export const upsertInterventionReason = createAsyncThunk(
  "intervention-reason/upsert",
  async (interventionReason, thunkAPI) => {
    const { access_token } = thunkAPI.getState().auth.identify;

    try {
      const response = await api.upsertIntervReason(
        access_token,
        interventionReason
      );
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const initInterventionReason = createAsyncThunk(
  "intervention-reason/init-intervention-reason",
  async (params, thunkAPI) => {
    try {
      const response = await api.initInterventionReason(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const interventionReasonSlice = createSlice({
  name: "interventionReason",
  initialState,
  reducers: {
    setInterventionReason(state, action) {
      state.single.data = action.payload;
    },
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchInterventionReasons.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchInterventionReasons.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data;
      })
      .addCase(fetchInterventionReasons.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(upsertInterventionReason.pending, (state, action) => {
        state.single.status = "loading";
      })
      .addCase(upsertInterventionReason.fulfilled, (state, action) => {
        state.single.status = "succeeded";
        const intv = action.payload.data[0];

        const index = state.list.findIndex((i) => i.id === intv.id);
        if (index !== -1) {
          state.list[index] = intv;
        } else {
          state.list.push(intv);
        }
      })
      .addCase(upsertInterventionReason.rejected, (state, action) => {
        state.single.status = "failed";
        state.single.error = action.error.message;
      })
      .addCase(initInterventionReason.pending, (state, action) => {
        state.initInterventionReason.status = "loading";
      })
      .addCase(initInterventionReason.fulfilled, (state, action) => {
        state.initInterventionReason.status = "succeeded";
      })
      .addCase(initInterventionReason.rejected, (state, action) => {
        state.initInterventionReason.status = "failed";
      });
  },
});

export const { setInterventionReason, reset } = interventionReasonSlice.actions;

export default interventionReasonSlice.reducer;

export const selectAllInterventionReasons = (state) =>
  state.admin.interventionReason.list;

export const selectParentInterventionReasons = (state) =>
  state.admin.interventionReason.list.filter((i) => !i.parentId);

export const selectInterventionReason = (state) =>
  state.admin.interventionReason.single.data;
