import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import dayjs from "dayjs";

import { Creators as PrescriptionsCreators } from "store/ducks/prescriptions";
import { fetchPrescriptionsListThunk } from "store/ducks/prescriptions/thunk";
import {
  enableTrainingMocks,
  disableTrainingMocks,
} from "./mock/trainingMockState";
import { seedTrainingPatients } from "./mock/fixtures/patients";
import { getTraining } from "./trainings";

export type TrainingStatus = "idle" | "active" | "completed";

interface TrainingState {
  status: TrainingStatus;
  trainingId: string | null;
  stepIndex: number;
  /** True between a step being detected as done and the advance to the next. */
  stepJustCompleted: boolean;
}

/**
 * This slice is intentionally NOT persisted (redux-persist is opt-in per
 * reducer) and only stores the training id: content lives in the registry
 * (trainings/). A page refresh therefore always exits training mode and
 * restores real data.
 */
const initialState: TrainingState = {
  status: "idle",
  trainingId: null,
  stepIndex: 0,
  stepJustCompleted: false,
};

const trainingSlice = createSlice({
  name: "training",
  initialState,
  reducers: {
    trainingStarted(state, action: PayloadAction<string>) {
      state.status = "active";
      state.trainingId = action.payload;
      state.stepIndex = 0;
      state.stepJustCompleted = false;
    },
    stepCompleted(state) {
      state.stepJustCompleted = true;
    },
    advanceStep(state) {
      if (state.status !== "active") {
        return;
      }

      state.stepJustCompleted = false;
      const training = getTraining(state.trainingId);
      if (!training || state.stepIndex >= training.steps.length - 1) {
        state.status = "completed";
        return;
      }
      state.stepIndex += 1;
    },
    trainingStopped() {
      return initialState;
    },
    /**
     * Signal action bridging tracker events (utils/tracker.ts) into redux so
     * trainingMiddleware can evaluate step conditions. Never changes state.
     */
    trainingTrackerEvent(
      _state,
      _action: PayloadAction<{
        event: string;
        details: Record<string, unknown>;
      }>,
    ) {},
  },
});

export const {
  trainingStarted,
  stepCompleted,
  advanceStep,
  trainingStopped,
  trainingTrackerEvent,
} = trainingSlice.actions;

export const trainingReducer = trainingSlice.reducer;

export const startTraining =
  (trainingId: string) => async (dispatch: any) => {
    enableTrainingMocks();
    seedTrainingPatients();
    dispatch(trainingStarted(trainingId));
    // replaces the on-screen list with fixtures (answered by the mock layer)
    dispatch(fetchPrescriptionsListThunk({ agg: 1 }));
  };

export const stopTraining = () => async (dispatch: any, getState: any) => {
  disableTrainingMocks();
  dispatch(trainingStopped());

  // restore real data with the same default params a fresh page load uses
  const filter = getState().app.filter.screeningList;
  const idSegment = filter?.idSegment;
  const hasSegment = Array.isArray(idSegment) ? idSegment.length > 0 : !!idSegment;

  if (hasSegment) {
    dispatch(
      fetchPrescriptionsListThunk({
        idSegment: Array.isArray(idSegment) ? idSegment : [idSegment],
        agg: 1,
        currentDepartment: filter.currentDepartment,
        startDate: dayjs().format("YYYY-MM-DD"),
      }),
    );
  } else {
    dispatch(PrescriptionsCreators.prescriptionsFetchListSuccess([]));
  }
};
