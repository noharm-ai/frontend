import { createSlice } from "@reduxjs/toolkit";

interface IDrugGenerateScoreSlice {
  open: boolean;
  openCount: number;
  idDrug: number | null;
  idSegment: number | null;
  division: string | null;
  useWeight: boolean | null;
  idMeasureUnit: string | null;
  substance: any;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: IDrugGenerateScoreSlice = {
  open: false,
  openCount: 0,
  idDrug: null,
  idSegment: null,
  division: null,
  useWeight: null,
  idMeasureUnit: null,
  substance: null,
  status: "idle",
  error: null,
};

const drugGenerateScoreSlice = createSlice({
  name: "drugGenerateScore",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setDrugGenerateScoreOpen(
      state,
      action: {
        payload: {
          open: boolean;
          idDrug?: number | null;
          idSegment?: number | null;
          division?: string | null;
          useWeight?: boolean | null;
          idMeasureUnit?: string | null;
          substance?: any;
        };
      },
    ) {
      state.open = action.payload.open;
      if (action.payload.open) {
        state.openCount += 1;
        state.idDrug = action.payload.idDrug ?? null;
        state.idSegment = action.payload.idSegment ?? null;
        state.division = action.payload.division ?? null;
        state.useWeight = action.payload.useWeight ?? null;
        state.idMeasureUnit = action.payload.idMeasureUnit ?? null;
        state.substance = action.payload.substance ?? null;
      } else {
        state.status = "idle";
        state.error = null;
      }
    },
  },
});

export const { reset, setDrugGenerateScoreOpen } =
  drugGenerateScoreSlice.actions;

export default drugGenerateScoreSlice.reducer;
