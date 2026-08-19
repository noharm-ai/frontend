import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/api";
import { getErrorMessage } from "utils/errorHandler";
import { updateInterventionStatusThunk } from "store/ducks/prescriptions/thunk";
import { updateInterventionListStatusThunk } from "store/ducks/intervention/thunk";
import {
  buildOutcomeInitialValues,
  classifyOutcomeData,
  OUTCOME_CLASSIFICATION,
} from "../InterventionOutcome/outcomeValues";

const initialState = {
  open: false,
  stage: "idle", // idle | confirm | processing | review | finished
  outcome: null,
  idInterventionList: [],
  progress: 0,
  running: false,
  cancelRequested: false,
  results: [], // { idIntervention, drugName, status: applied | skipped | error, reason }
  reviewQueue: [], // { idIntervention, outcomeData }
  reviewIndex: 0,
  saveStatus: "idle",
  selectedRows: {
    active: false,
    list: [],
  },
};

export const fetchOutcomeDataMultiple = createAsyncThunk(
  "multiple-intervention-outcome/get-data",
  async (params, thunkAPI) => {
    try {
      const response = await api.intervention.getOutcomeData(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const applyOutcomeMultiple = createAsyncThunk(
  "multiple-intervention-outcome/set-outcome",
  async (params, thunkAPI) => {
    try {
      const response = await api.intervention.setOutcome(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

const multipleOutcomeSlice = createSlice({
  name: "multiple-intervention-outcome",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    startMultipleOutcome(state, action) {
      const { idInterventionList, outcome, skipConfirm } = action.payload;

      return {
        ...initialState,
        selectedRows: state.selectedRows,
        open: true,
        outcome,
        idInterventionList,
        stage: skipConfirm ? "processing" : "confirm",
      };
    },
    setStage(state, action) {
      state.stage = action.payload;
    },
    setProgress(state, action) {
      state.progress = action.payload;
    },
    setRunning(state, action) {
      state.running = action.payload;
    },
    requestCancel(state) {
      state.cancelRequested = true;
    },
    addResult(state, action) {
      state.results.push(action.payload);
    },
    pushReviewItem(state, action) {
      state.reviewQueue.push(action.payload);
    },
    nextReviewItem(state) {
      state.reviewIndex += 1;

      if (state.reviewIndex >= state.reviewQueue.length) {
        state.stage = "finished";
      }
    },
    setSelectedRowsActive(state, action) {
      state.selectedRows.active = action.payload;

      if (!action.payload) {
        state.selectedRows.list = [];
      }
    },
    setSelectedRows(state, action) {
      state.selectedRows.list = action.payload;
    },
    toggleSelectedRows(state, action) {
      const index = state.selectedRows.list.indexOf(action.payload);

      if (index === -1) {
        state.selectedRows.list.push(action.payload);
      } else {
        state.selectedRows.list.splice(index, 1);
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(applyOutcomeMultiple.pending, (state) => {
        state.saveStatus = "loading";
      })
      .addCase(applyOutcomeMultiple.fulfilled, (state) => {
        state.saveStatus = "succeeded";
      })
      .addCase(applyOutcomeMultiple.rejected, (state) => {
        state.saveStatus = "failed";
      });
  },
});

export const {
  reset,
  startMultipleOutcome,
  setStage,
  setProgress,
  setRunning,
  requestCancel,
  addResult,
  pushReviewItem,
  nextReviewItem,
  setSelectedRowsActive,
  setSelectedRows,
  toggleSelectedRows,
} = multipleOutcomeSlice.actions;

export const runMultipleOutcomeThunk = (t) => async (dispatch, getState) => {
  const initial = getState().multipleInterventionOutcome;

  if (initial.running) {
    return;
  }

  dispatch(setRunning(true));

  const { idInterventionList, outcome } = initial;
  const progressStep = 100 / idInterventionList.length;
  let progressTotal = 0;

  for (let i = 0; i < idInterventionList.length; i++) {
    const idIntervention = idInterventionList[i];
    const canceled =
      getState().multipleInterventionOutcome.cancelRequested;

    if (canceled) {
      dispatch(
        addResult({
          idIntervention,
          drugName: null,
          status: "skipped",
          reason: "canceled",
        }),
      );
    } else {
      const fetchResponse = await dispatch(
        fetchOutcomeDataMultiple({ idIntervention }),
      );

      if (fetchResponse.payload?.status !== "success") {
        dispatch(
          addResult({
            idIntervention,
            drugName: null,
            status: "error",
            reason: getErrorMessage(fetchResponse, t),
          }),
        );
      } else {
        const outcomeData = fetchResponse.payload.data;
        const drugName = outcomeData.header?.originDrug;
        const classification = classifyOutcomeData(outcomeData, outcome);

        if (classification === OUTCOME_CLASSIFICATION.SKIP_ARCHIVED) {
          dispatch(
            addResult({
              idIntervention,
              drugName,
              status: "skipped",
              reason: "archived",
            }),
          );
        } else if (classification === OUTCOME_CLASSIFICATION.SKIP_CLOSED) {
          dispatch(
            addResult({
              idIntervention,
              drugName,
              status: "skipped",
              reason: "closed",
            }),
          );
        } else if (classification === OUTCOME_CLASSIFICATION.REVIEW) {
          dispatch(pushReviewItem({ idIntervention, outcomeData }));
        } else {
          const payload = buildOutcomeInitialValues(outcomeData, outcome);
          const saveResponse = await dispatch(applyOutcomeMultiple(payload));

          if (saveResponse.payload?.status !== "success") {
            dispatch(
              addResult({
                idIntervention,
                drugName,
                status: "error",
                reason: getErrorMessage(saveResponse, t),
              }),
            );
          } else {
            dispatch(
              addResult({
                idIntervention,
                drugName,
                status: "applied",
                reason: null,
              }),
            );
            dispatch(updateInterventionStatusThunk(idIntervention, outcome));
            dispatch(
              updateInterventionListStatusThunk(idIntervention, outcome),
            );
          }
        }
      }
    }

    if (i === idInterventionList.length - 1) {
      progressTotal = 100;
    } else {
      progressTotal += progressStep;
    }

    dispatch(setProgress(progressTotal));
  }

  const finalState = getState().multipleInterventionOutcome;

  if (finalState.cancelRequested) {
    finalState.reviewQueue.forEach((item) => {
      dispatch(
        addResult({
          idIntervention: item.idIntervention,
          drugName: item.outcomeData.header?.originDrug,
          status: "skipped",
          reason: "canceled",
        }),
      );
    });
    dispatch(setStage("finished"));
  } else if (finalState.reviewQueue.length > 0) {
    dispatch(setStage("review"));
  } else {
    dispatch(setStage("finished"));
  }

  dispatch(setSelectedRows([]));
  dispatch(setSelectedRowsActive(false));
  dispatch(setRunning(false));
};

export default multipleOutcomeSlice.reducer;
