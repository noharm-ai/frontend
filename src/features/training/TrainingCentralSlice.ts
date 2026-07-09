import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/api";

export interface ITrainingModule {
  id: number;
  page: string;
  title: string;
  description: string;
  position: number;
  totalLessons: number;
  totalLessonsFinished: number;
}

interface ITrainingCentralSlice {
  status: string;
  error: string | null;
  list: ITrainingModule[];
}

const initialState: ITrainingCentralSlice = {
  status: "idle",
  error: null,
  list: [],
};

export const fetchTrainingList = createAsyncThunk(
  "training/fetch-list",
  async (params: any, thunkAPI) => {
    try {
      const response = await api.training.getList(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

const trainingCentralSlice = createSlice({
  name: "trainingCentralSlice",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchTrainingList.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTrainingList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data;
      })
      .addCase(fetchTrainingList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message!;
        state.list = [];
      });
  },
});

export const { reset } = trainingCentralSlice.actions;

export default trainingCentralSlice.reducer;
