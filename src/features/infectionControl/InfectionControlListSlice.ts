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

// an option chosen in a searched select, kept with its name so it shows
// while other searches come and go
export interface ILabeledValue {
  value: number;
  label: string;
}

// a range of treatment days (D1 is the first 24 hours); either end may be open
export interface ITreatmentDays {
  from: number | null;
  to: number | null;
}

// what an antimicrobial criterion is searched by: drugs or substances, never
// both
export type AntimicrobialCriterionType = "drug" | "substance";

// one running antimicrobial the worklist asks for: any of these drugs or any
// of these substances, as its type says, on a treatment day of the range;
// every part is optional
export interface IAntimicrobialCriterion {
  type: AntimicrobialCriterionType;
  drugs: ILabeledValue[];
  substances: ILabeledValue[];
  treatmentDays: ITreatmentDays | null;
}

export const EMPTY_CRITERION: IAntimicrobialCriterion = {
  type: "drug",
  drugs: [],
  substances: [],
  treatmentDays: null,
};

// at most this many antimicrobial criteria (the backend refuses more)
export const MAX_CRITERIA = 10;

/** Whether a criterion asks for nothing yet */
export const isEmptyCriterion = (criterion: IAntimicrobialCriterion) =>
  !criterion.drugs.length &&
  !criterion.substances.length &&
  !criterion.treatmentDays;

// an antimicrobial found by name
export interface IAntimicrobialOption {
  id: number;
  name: string;
}

// the worklist filters; the antimicrobials and substances keep their names,
// filtersToRequest sends only the ids
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
  // the filters below match what the follow-up last saw running
  // admissions meeting any criterion, or every one with
  // antimicrobialsMatchAll, each by a running antimicrobial of its own (e.g.
  // amoxicillin on D1 and vancomycin on D2). One value, so the "see more"
  // badge counts it once
  antimicrobials: IAntimicrobialCriterion[];
  // how the criteria combine; the badge leaves it out, it is part of them
  antimicrobialsMatchAll: boolean;
  // admissions running an antimicrobial of any of these AWaRe levels
  awareLevels: number[];
  // admissions with an evaluation in force judged non conforming
  nonConforming: boolean;
  // the closed admissions listed are the ones closed within this many days
  // (all of them when searched by admission number)
  closedDays: number;
}

// how far back the closed admissions can be listed, in days
export const CLOSED_DAYS_OPTIONS = [7, 30, 90, 180, 365];

export const DEFAULT_FILTERS: IInfectionControlListFilters = {
  status: [InfectionControlStatusEnum.PENDING],
  idDepartment: [],
  pendingTypes: [],
  admissionNumbers: [],
  overdueReview: false,
  antimicrobials: [],
  antimicrobialsMatchAll: false,
  awareLevels: [],
  nonConforming: false,
  closedDays: 30,
};

/** Whether the statuses list the closed admissions: none chosen lists every
 * status */
export const listsClosed = (status: number[] | undefined) =>
  !status?.length || status.includes(InfectionControlStatusEnum.CLOSED);

/** Whether the filters ask only for closed admissions, which have nothing
 * running, no open reason and no evaluation in force: the antimicrobial and
 * follow-up filters find none of them */
export const isClosedOnly = (status: number[] | undefined) =>
  status?.length === 1 && status[0] === InfectionControlStatusEnum.CLOSED;

/** The worklist filters as the backend takes them, but the status; the
 * criteria that ask for nothing are left out, and each sends only the list of
 * its type. With only the closed ones the filters they never match are
 * disabled, and left out too */
export const filtersToRequest = (filters: IInfectionControlListFilters) => {
  const closedOnly = isClosedOnly(filters.status);

  return {
    ...filters,
    awareLevels: closedOnly ? [] : filters.awareLevels,
    pendingTypes: closedOnly ? [] : filters.pendingTypes,
    nonConforming: closedOnly ? false : filters.nonConforming,
    antimicrobials: (closedOnly ? [] : filters.antimicrobials)
      .filter((criterion) => !isEmptyCriterion(criterion))
      .map(({ type, drugs, substances, treatmentDays }) => ({
        idDrug: type === "drug" ? drugs.map((drug) => drug.value) : [],
        idSubstance:
          type === "substance"
            ? substances.map((substance) => substance.value)
            : [],
        treatmentDayFrom: treatmentDays?.from ?? null,
        treatmentDayTo: treatmentDays?.to ?? null,
      })),
  };
};

/**
 * The worklist filters, but the status, as a query string: the patient page
 * opens in a new tab, without the worklist state, and takes them from its URL
 * to go to the next pending patient of the same worklist. Empty with no filter
 */
export const filtersToSearch = (filters: IInfectionControlListFilters) => {
  const params = new URLSearchParams();
  const request = filtersToRequest(filters);
  (
    ["idDepartment", "pendingTypes", "admissionNumbers", "awareLevels"] as const
  ).forEach((key) => {
    if (request[key].length) params.set(key, request[key].join(","));
  });
  if (request.antimicrobials.length) {
    params.set("antimicrobials", JSON.stringify(request.antimicrobials));
    if (filters.antimicrobialsMatchAll)
      params.set("antimicrobialsMatchAll", "1");
  }
  if (filters.overdueReview) params.set("overdueReview", "1");
  if (filters.nonConforming) params.set("nonConforming", "1");

  return params.toString();
};

/**
 * The antimicrobial criteria of a filtersToSearch query string, without the
 * names; anything else than ids and days is dropped
 */
const criteriaFromSearch = (search: string | null) => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(search ?? "[]");
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const ids = (list: unknown) =>
    (Array.isArray(list) ? list : [])
      .filter((value) => Number.isInteger(value) && value > 0)
      .map((value: number) => ({ value, label: String(value) }));
  const day = (value: unknown) =>
    Number.isInteger(value) && (value as number) > 0 ? (value as number) : null;

  return parsed
    .slice(0, MAX_CRITERIA)
    .map((item: any): IAntimicrobialCriterion => {
      const from = day(item?.treatmentDayFrom);
      const to = day(item?.treatmentDayTo);
      const drugs = ids(item?.idDrug);
      const substances = ids(item?.idSubstance);
      return {
        type: !drugs.length && substances.length ? "substance" : "drug",
        drugs,
        substances,
        treatmentDays: from || to ? { from, to } : null,
      };
    })
    .filter((criterion) => !isEmptyCriterion(criterion));
};

/**
 * The worklist filters of a filtersToSearch query string. The antimicrobials
 * and substances come without their names: the patient page only searches
 * with them
 */
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
    antimicrobials: criteriaFromSearch(params.get("antimicrobials")),
    antimicrobialsMatchAll: params.get("antimicrobialsMatchAll") === "1",
    awareLevels: numbers("awareLevels"),
    nonConforming: params.get("nonConforming") === "1",
  };
};

type Status = "idle" | "loading" | "succeeded" | "failed";

interface IInfectionControlListSlice {
  status: Status;
  list: IFollowedAdmission[];
  // every admission matching the filters: more than the list holds when the
  // limit cut it. The backend counts up to a limit of its own
  count: number;
  // more match than the backend counted
  countLimited: boolean;
  // the backend's error code when the list failed
  errorCode: string | null;
  filters: IInfectionControlListFilters;
  // the latest load: switching filters quickly drops the responses to the
  // earlier ones
  requestId: string | null;
}

const initialState: IInfectionControlListSlice = {
  status: "idle",
  list: [],
  count: 0,
  countLimited: false,
  errorCode: null,
  filters: DEFAULT_FILTERS,
  requestId: null,
};

export const fetchFollowedAdmissions = createAsyncThunk(
  "infectionControlList/fetchFollowedAdmissions",
  async (filters: IInfectionControlListFilters, thunkAPI) => {
    try {
      const response = await api.infectionControl.listAdmissions({
        ...filtersToRequest(filters),
        status: filters.status.length ? filters.status : ALL_STATUSES,
        limit: LIST_LIMIT,
        offset: 0,
      });
      const data: {
        count: number;
        countLimited: boolean;
        admissions: IFollowedAdmission[];
      } = response.data.data;

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
        ...filtersToRequest(params.filters),
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

/** Antimicrobials by name, for the worklist filter; kept by the caller */
export const searchAntimicrobials = createAsyncThunk(
  "infectionControlList/searchAntimicrobials",
  async (params: { term: string }, thunkAPI) => {
    try {
      const response = await api.infectionControl.searchAntimicrobials(
        params.term,
      );

      return response.data.data as IAntimicrobialOption[];
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
        state.errorCode = null;
      })
      .addCase(fetchFollowedAdmissions.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.status = "succeeded";
        state.list = action.payload.admissions;
        state.count = action.payload.count;
        state.countLimited = action.payload.countLimited ?? false;
      })
      .addCase(fetchFollowedAdmissions.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.status = "failed";
        state.list = [];
        state.count = 0;
        state.countLimited = false;
        state.errorCode = (action.payload as any)?.code ?? null;
      });
  },
});

export const { setFilters } = infectionControlListSlice.actions;

export const infectionControlListReducer = infectionControlListSlice.reducer;
