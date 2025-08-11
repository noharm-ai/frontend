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
  inferFrequencies: {
    status: "idle",
    error: null,
  },
};

export const fetchFrequencies = createAsyncThunk(
  "admin-frequency/fetch",
  async (params, thunkAPI) => {
    try {
      const response = await api.frequency.getFrequencyList(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const upsertFrequency = createAsyncThunk(
  "admin-frequency/upsert",
  async (params, thunkAPI) => {
    try {
      const response = await api.frequency.updateFrequency(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const inferFrequencies = createAsyncThunk(
  "admin-frequency/infer",
  async (params, thunkAPI) => {
    try {
      const response = await api.frequency.inferFrequencies(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const frequencySlice = createSlice({
  name: "adminFrequency",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setFrequency(state, action) {
      state.single.data = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchFrequencies.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchFrequencies.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data.data;
      })
      .addCase(fetchFrequencies.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(upsertFrequency.pending, (state, action) => {
        state.single.status = "loading";
      })
      .addCase(upsertFrequency.fulfilled, (state, action) => {
        state.single.status = "succeeded";
        const freq = action.payload.data[0];

        const index = state.list.findIndex((i) => i.id === freq.id);
        if (index !== -1) {
          state.list[index] = freq;
        } else {
          state.list.push(freq);
        }
      })
      .addCase(upsertFrequency.rejected, (state, action) => {
        state.single.status = "failed";
        state.single.error = action.error.message;
      })

      .addCase(inferFrequencies.pending, (state, action) => {
        state.inferFrequencies.status = "loading";
      })
      .addCase(inferFrequencies.fulfilled, (state, action) => {
        state.inferFrequencies.status = "succeeded";
      })
      .addCase(inferFrequencies.rejected, (state, action) => {
        state.inferFrequencies.status = "failed";
        state.inferFrequencies.error = action.error.message;
      });
  },
});

export const { reset, setFrequency } = frequencySlice.actions;

export default frequencySlice.reducer;
