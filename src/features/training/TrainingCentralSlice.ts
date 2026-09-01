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
  // effective for the logged user: the backend resolves the module's schema
  // scope and audience before flagging it
  mandatory: boolean;
  // backed by the treinamento_usuario completion record: stays true when new
  // lessons reopen the module, so an earned certificate is never lost
  certificateAvailable: boolean;
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
