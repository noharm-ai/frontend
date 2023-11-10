import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";

const initialState = {
  departments: {
    status: "idle",
    error: null,
    list: [],
  },
  single: {
    data: null,
    status: "idle",
    error: null,
  },
  saveDepartments: {
    status: "idle",
    error: null,
  },
};

export const fetchDepartments = createAsyncThunk(
  "admin-segment/fetch-departments",
  async (params, thunkAPI) => {
    try {
      const response = await api.getSegmentDepartments(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const saveDepartments = createAsyncThunk(
  "admin-segment/save-departments",
  async (params, thunkAPI) => {
    try {
      const response = await api.updateSegmentDepartments(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const segmentSlice = createSlice({
  name: "adminSegment",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setSegment(state, action) {
      state.single.data = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchDepartments.pending, (state, action) => {
        state.departments.status = "loading";
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departments.status = "succeeded";
        state.departments.list = action.payload.data.data;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.departments.status = "failed";
        state.departments.error = action.error.message;
        state.departments.list = [];
      })
      .addCase(saveDepartments.pending, (state, action) => {
        state.saveDepartments.status = "loading";
      })
      .addCase(saveDepartments.fulfilled, (state, action) => {
        state.saveDepartments.status = "succeeded";
      })
      .addCase(saveDepartments.rejected, (state, action) => {
        state.saveDepartments.status = "failed";
      });
  },
});

export const { reset, setSegment } = segmentSlice.actions;

export default segmentSlice.reducer;
