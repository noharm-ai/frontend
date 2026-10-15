import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/api";
import hospital from "services/hospital";
import { InfectionControlStatusEnum } from "models/InfectionControlEnum";

import { IFollowUpPending } from "./InfectionControlSlice";

export const PAGE_SIZE = 50;
// the worklist loads at most this many admissions and pages them in the
// browser, where the patient names are
export const LIST_LIMIT = 500;

const ALL_STATUSES = [
  InfectionControlStatusEnum.PENDING,
  InfectionControlStatusEnum.REVISED,
  InfectionControlStatusEnum.CLOSED,
];

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

// the worklist filters, as the backend takes them
export interface IInfectionControlListFilters {
  // InfectionControlStatusEnum shown; none means every status
  status: number[];
  // department of the latest prescription of the admission
  idDepartment: number[];
  // InfectionControlPendingTypeEnum: admissions with any of these open
  pendingTypes: number[];
  admissionNumbers: number[];
  // only admissions whose scheduled review date has passed
  overdueReview: boolean;
}

export const DEFAULT_FILTERS: IInfectionControlListFilters = {
  status: [InfectionControlStatusEnum.PENDING],
  idDepartment: [],
  pendingTypes: [],
  admissionNumbers: [],
  overdueReview: false,
};

/**
 * The worklist filters, but the status, as a query string: the patient page
 * opens in a new tab, without the worklist state, and takes them from its URL
 * to go to the next pending patient of the same worklist. Empty with no filter
 */
export const filtersToSearch = (filters: IInfectionControlListFilters) => {
  const params = new URLSearchParams();
  (["idDepartment", "pendingTypes", "admissionNumbers"] as const).forEach(
    (key) => {
      if (filters[key].length) params.set(key, filters[key].join(","));
    },
  );
  if (filters.overdueReview) params.set("overdueReview", "1");

  return params.toString();
};

/** The worklist filters of a filtersToSearch query string */
export const filtersFromSearch = (
  params: URLSearchParams,
): IInfectionControlListFilters => {
  const numbers = (key: string) =>
    (params.get(key) ?? "")
      .split(",")
      .filter((value) => /^\d+$/.test(value))
      .map(Number);

  return {
    ...DEFAULT_FILTERS,
    idDepartment: numbers("idDepartment"),
    pendingTypes: numbers("pendingTypes"),
    admissionNumbers: numbers("admissionNumbers"),
    overdueReview: params.get("overdueReview") === "1",
  };
};

type Status = "idle" | "loading" | "succeeded" | "failed";

interface IInfectionControlListSlice {
  status: Status;
  list: IFollowedAdmission[];
  // every admission matching the filters: more than the list holds when the
  // limit cut it
  count: number;
  filters: IInfectionControlListFilters;
  // the latest load: switching filters quickly drops the responses to the
  // earlier ones
  requestId: string | null;
}

const initialState: IInfectionControlListSlice = {
  status: "idle",
  list: [],
  count: 0,
  filters: DEFAULT_FILTERS,
  requestId: null,
};

export const fetchFollowedAdmissions = createAsyncThunk(
  "infectionControlList/fetchFollowedAdmissions",
  async (filters: IInfectionControlListFilters, thunkAPI) => {
    try {
      const response = await api.infectionControl.listAdmissions({
        ...filters,
        status: filters.status.length ? filters.status : ALL_STATUSES,
        limit: LIST_LIMIT,
        offset: 0,
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

/**
 * The pending admission after `admissionNumber` in the worklist order (the
 * ones pending longest first), within the worklist filters; null when it is
 * the only one. One that left the pending ones (just reviewed) is followed by
 * the first, and the last by the first, back to the ones skipped earlier.
 * Leaves the worklist state alone: the patient page asks for it
 */
export const fetchNextPending = createAsyncThunk(
  "infectionControlList/fetchNextPending",
  async (
    params: {
      admissionNumber: number;
      filters: IInfectionControlListFilters;
    },
    thunkAPI,
  ) => {
    try {
      const response = await api.infectionControl.listAdmissions({
        ...params.filters,
        status: [InfectionControlStatusEnum.PENDING],
        limit: LIST_LIMIT,
        offset: 0,
      });
      const admissions: number[] = (
        response.data.data.admissions as IFollowedAdmission[]
      ).map((admission) => admission.admissionNumber);

      const index = admissions.indexOf(params.admissionNumber);
      const next = admissions[(index + 1) % admissions.length];

      return next !== undefined && next !== params.admissionNumber
        ? next
        : null;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

const infectionControlListSlice = createSlice({
  name: "infectionControlList",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<IInfectionControlListFilters>) {
      state.filters = action.payload;
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

export const { setFilters } = infectionControlListSlice.actions;

export const infectionControlListReducer = infectionControlListSlice.reducer;
