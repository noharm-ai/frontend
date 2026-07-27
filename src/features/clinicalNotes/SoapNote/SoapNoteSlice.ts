import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import api from "services/api";

export interface ISoapNoteSource {
  id: string;
  admissionNumber: number;
}

export interface ISoapNoteSaveParams {
  admissionNumber: number;
  notes: string;
  tplName: string;
}

interface ISoapNoteSlice {
  note: ISoapNoteSource | null;
  generate: {
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    text: string;
  };
  save: {
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
}

const initialState: ISoapNoteSlice = {
  note: null,
  generate: {
    status: "idle",
    error: null,
    text: "",
  },
  save: {
    status: "idle",
    error: null,
  },
};

export const generateSoapNote = createAsyncThunk(
  "soapNote/generate",
  async (params: { id: string }, thunkAPI) => {
    try {
      const response = await api.clinicalNotes.generateSoap(params);
      return response.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.response?.data);
    }
  },
);

export const saveSoapNote = createAsyncThunk(
  "soapNote/save",
  async (params: ISoapNoteSaveParams, thunkAPI) => {
    try {
      const response = await api.clinicalNotes.createClinicalNote(params);
      return response.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.response?.data);
    }
  },
);

const soapNoteSlice = createSlice({
  name: "soapNote",
  initialState,
  reducers: {
    openSoapNote(state, action: PayloadAction<ISoapNoteSource>) {
      state.note = action.payload;
      state.generate = { ...initialState.generate };
      state.save = { ...initialState.save };
    },
    closeSoapNote() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(generateSoapNote.pending, (state) => {
        state.generate.status = "loading";
        state.generate.error = null;
        state.generate.text = "";
      })
      .addCase(generateSoapNote.fulfilled, (state, action) => {
        state.generate.status = "succeeded";
        state.generate.text = action.payload?.data?.text ?? "";
      })
      .addCase(generateSoapNote.rejected, (state, action) => {
        state.generate.status = "failed";
        state.generate.error =
          (action.payload as any)?.message ?? "Erro ao gerar evolução";
      })
      .addCase(saveSoapNote.pending, (state) => {
        state.save.status = "loading";
        state.save.error = null;
      })
      .addCase(saveSoapNote.fulfilled, (state) => {
        state.save.status = "succeeded";
      })
      .addCase(saveSoapNote.rejected, (state, action) => {
        state.save.status = "failed";
        state.save.error =
          (action.payload as any)?.message ?? "Erro ao salvar evolução";
      });
  },
});

export const { openSoapNote, closeSoapNote } = soapNoteSlice.actions;
export const soapNoteReducer = soapNoteSlice.reducer;
