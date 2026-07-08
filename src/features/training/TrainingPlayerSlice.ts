import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/api";

export interface ITrainingQuestionAnswer {
  text: string;
  correct: boolean;
}

export interface ITrainingQuestion {
  question: string;
  answers: ITrainingQuestionAnswer[];
}

export interface ITrainingItem {
  id: number;
  trainingId: number;
  title: string;
  text: string;
  video: string | null;
  position: number;
  questions: ITrainingQuestion[] | null;
}

interface ITrainingPlayerSlice {
  status: string;
  error: string | null;
  list: ITrainingItem[];
}

const initialState: ITrainingPlayerSlice = {
  status: "idle",
  error: null,
  list: [],
};

export const fetchTrainingItems = createAsyncThunk(
  "training/fetch-items",
  async (idTraining: string | undefined, thunkAPI) => {
    try {
      const response = await api.training.getItems(idTraining);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

const trainingPlayerSlice = createSlice({
  name: "trainingPlayerSlice",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchTrainingItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTrainingItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data;
      })
      .addCase(fetchTrainingItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message!;
        state.list = [];
      });
  },
});

export const { reset } = trainingPlayerSlice.actions;

export default trainingPlayerSlice.reducer;
