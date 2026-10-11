import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/api";
import hospital from "services/hospital";
import { InfectionControlStatusEnum } from "models/InfectionControlEnum";

import { IFollowUpPending } from "./InfectionControlSlice";

export const PAGE_SIZE = 50;

// one followed admission of the worklist
export interface IFollowedAdmission {
  admissionNumber: number;
  idPatient: string | null;
  birthdate: string | null;
  gender: string | null;
  admissionDate: string | null;
  bed: string | null;
  department: string | null;
  // InfectionControlStatusEnum
  status: number;
  statusDate: string;
  nextReviewDate: string | null;
  // the earliest valid-until date among the evaluations in force
  earliestValidUntil: string | null;
  pendings: IFollowUpPending[];
}

type Status = "idle" | "loading" | "succeeded" | "failed";

interface IInfectionControlListSlice {
  status: Status;
  list: IFollowedAdmission[];
  count: number;
  // InfectionControlStatusEnum shown
  filterStatus: number;
  page: number;
  // the latest load: switching filters or pages quickly drops the responses
  // to the earlier ones
  requestId: string | null;
}

const initialState: IInfectionControlListSlice = {
  status: "idle",
  list: [],
  count: 0,
  filterStatus: InfectionControlStatusEnum.PENDING,
  page: 1,
  requestId: null,
};

export const fetchFollowedAdmissions = createAsyncThunk(
  "infectionControlList/fetchFollowedAdmissions",
  async (params: { status: number; page: number }, thunkAPI) => {
    try {
      const response = await api.infectionControl.listAdmissions({
        status: [params.status],
        limit: PAGE_SIZE,
        offset: (params.page - 1) * PAGE_SIZE,
      });
      const data: { count: number; admissions: IFollowedAdmission[] } =
        response.data.data;

      // names come from the hospital name service; PatientNameCache shows them
      // once they arrive, so the list does not wait for them
      const { config } = (thunkAPI.getState() as any).app;
      // the JSDoc of getPatients leaves out the name service settings
      (hospital.getPatients as any)({
        listToRequest: data.admissions
          .filter((a) => a.idPatient)
          .map((a) => ({ idPatient: a.idPatient, birthdate: a.birthdate })),
        nameUrl: config.nameUrl,
        proxy: config.proxy,
        nameHeaders: config.nameHeaders,
      }).catch(() => {});

      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

const infectionControlListSlice = createSlice({
  name: "infectionControlList",
  initialState,
  reducers: {
    setFilterStatus(state, action: PayloadAction<number>) {
      state.filterStatus = action.payload;
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchFollowedAdmissions.pending, (state, action) => {
        state.status = "loading";
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchFollowedAdmissions.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.status = "succeeded";
        state.list = action.payload.admissions;
        state.count = action.payload.count;
      })
      .addCase(fetchFollowedAdmissions.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.status = "failed";
        state.list = [];
        state.count = 0;
      });
  },
});

export const { setFilterStatus, setPage } = infectionControlListSlice.actions;

export const infectionControlListReducer = infectionControlListSlice.reducer;
