import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/api";

export interface ITrainingOverviewModule {
  id: number;
  title: string;
  position: number;
  totalLessons: number;
  audience: string;
  // the schema-level obligation; whether it lands on a given user also depends
  // on the audience, which is why ITrainingOverviewUserModule has its own flag
  mandatory: boolean;
}

export interface ITrainingOverviewUserModule {
  id: number;
  // effective for this user: the backend resolves scope and audience
  mandatory: boolean;
  totalLessons: number;
  totalLessonsFinished: number;
  // every active lesson done. A module that gained lessons after the user
  // finished it is pending again, which is the same reading that gates support
  // tickets — so this is never derived from completedAt
  finished: boolean;
  // when the module was first completed, if ever; survives new lessons
  completedAt: string | null;
}

export interface ITrainingOverviewUser {
  id: number;
  name: string;
  email: string;
  active: boolean;
  // carries the onboarding record, which is what "new_users" modules target
  newUser: boolean;
  mandatoryTotal: number;
  mandatoryFinished: number;
  optionalTotal: number;
  optionalFinished: number;
  totalLessons: number;
  totalLessonsFinished: number;
  lastActivityAt: string | null;
  modules: ITrainingOverviewUserModule[];
}

interface ITrainingOverviewSlice {
  status: string;
  error: string | null;
  modules: ITrainingOverviewModule[];
  users: ITrainingOverviewUser[];
}

const initialState: ITrainingOverviewSlice = {
  status: "idle",
  error: null,
  modules: [],
  users: [],
};

export const fetchTrainingOverview = createAsyncThunk(
  "training/fetch-overview",
  async (params: any, thunkAPI) => {
    try {
      const response = await api.training.getOverview(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

const trainingOverviewSlice = createSlice({
  name: "trainingOverviewSlice",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchTrainingOverview.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTrainingOverview.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.modules = action.payload.data.modules;
        state.users = action.payload.data.users;
      })
      .addCase(fetchTrainingOverview.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message!;
        state.modules = [];
        state.users = [];
      });
  },
});

export const { reset } = trainingOverviewSlice.actions;

export default trainingOverviewSlice.reducer;
