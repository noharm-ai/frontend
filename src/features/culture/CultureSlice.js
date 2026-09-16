import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/api";
import { Types as PrescriptionTypes } from "store/ducks/prescriptions";

/**
 * Cultures of the patient, flagged against the prescription
 * (GET /prescriptions/:id/cultures).
 *
 * They are not part of the prescription payload: the culture card sits behind
 * a tab and the list weighed on every load of the screen, so it is fetched
 * when the tab is opened and cached for the prescription. The tab badge does
 * not need it, the prescription carries the count (cultureStats).
 */

const initialState = {
  status: "idle",
  error: null,
  idPrescription: null,
  list: [],
};

const sameId = (a, b) => `${a}` === `${b}`;

export const fetchCultures = createAsyncThunk(
  "cultures/fetch",
  async ({ idPrescription }, thunkAPI) => {
    try {
      const response = await api.getPrescriptionCultures(null, idPrescription);

      return response.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
  {
    condition: ({ idPrescription, force }, { getState }) => {
      const { status, idPrescription: loaded } = getState().cultures;

      if (status === "loading") {
        return false;
      }

      if (force) {
        return true;
      }

      // cached for the prescription until it is loaded again (below); a
      // failure is not retried on its own, the card offers the retry
      return !(
        sameId(loaded, idPrescription) &&
        (status === "succeeded" || status === "failed")
      );
    },
  },
);

const cultureSlice = createSlice({
  name: "cultures",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCultures.pending, (state, action) => {
        const { idPrescription } = action.meta.arg;

        state.status = "loading";
        state.error = null;

        // another prescription: its list must not show while this one loads
        if (!sameId(state.idPrescription, idPrescription)) {
          state.list = [];
          state.idPrescription = idPrescription;
        }
      })
      .addCase(fetchCultures.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload || [];
      })
      .addCase(fetchCultures.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || action.error?.message;
      })
      // the "prescribed" flag compares the cultures to the drug list, which
      // a new load of the prescription may have changed: the cache is stale,
      // and the card fetches again if its tab is open
      .addCase(PrescriptionTypes.PRESCRIPTIONS_FETCH_SINGLE_SUCCESS, (state) => {
        if (state.status !== "loading") {
          state.status = "idle";
        }
      });
  },
});

export const { reset } = cultureSlice.actions;

export const cultureReducer = cultureSlice.reducer;
