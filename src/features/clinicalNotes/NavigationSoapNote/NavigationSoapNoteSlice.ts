import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import api from "services/api";

export interface INavigationSoapNoteSourceContent {
  html?: string;
  template?: any;
  form?: any;
}

export interface INavigationSoapNoteSource {
  id: string;
  admissionNumber: number;
  sourceContent?: INavigationSoapNoteSourceContent;
}

export interface INavigationSoapNoteSaveParams {
  admissionNumber: number;
  notes: string;
  tplName: string;
}

interface INavigationSoapNoteSlice {
  note: INavigationSoapNoteSource | null;
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

const initialState: INavigationSoapNoteSlice = {
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

export const generateNavigationSoapNote = createAsyncThunk(
  "navigationSoapNote/generate",
  async (params: { id: string }, thunkAPI) => {
    try {
      const response = await api.clinicalNotes.generateSoap(params);
      return response.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.response?.data);
    }
  },
);

export const saveNavigationSoapNote = createAsyncThunk(
  "navigationSoapNote/save",
  async (params: INavigationSoapNoteSaveParams, thunkAPI) => {
    try {
      const response = await api.clinicalNotes.createClinicalNote(params);
      return response.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.response?.data);
    }
  },
);

const navigationSoapNoteSlice = createSlice({
  name: "navigationSoapNote",
  initialState,
  reducers: {
    openNavigationSoapNote(state, action: PayloadAction<INavigationSoapNoteSource>) {
      state.note = action.payload;
      state.generate = { ...initialState.generate };
      state.save = { ...initialState.save };
    },
    closeNavigationSoapNote() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(generateNavigationSoapNote.pending, (state) => {
        state.generate.status = "loading";
        state.generate.error = null;
        state.generate.text = "";
      })
      .addCase(generateNavigationSoapNote.fulfilled, (state, action) => {
        state.generate.status = "succeeded";
        state.generate.text = action.payload?.data?.text ?? "";
      })
      .addCase(generateNavigationSoapNote.rejected, (state, action) => {
        state.generate.status = "failed";
        state.generate.error =
          (action.payload as any)?.message ?? "Erro ao gerar evolução";
      })
      .addCase(saveNavigationSoapNote.pending, (state) => {
        state.save.status = "loading";
        state.save.error = null;
      })
      .addCase(saveNavigationSoapNote.fulfilled, (state) => {
        state.save.status = "succeeded";
      })
      .addCase(saveNavigationSoapNote.rejected, (state, action) => {
        state.save.status = "failed";
        state.save.error =
          (action.payload as any)?.message ?? "Erro ao salvar evolução";
      });
  },
});

export const { openNavigationSoapNote, closeNavigationSoapNote } = navigationSoapNoteSlice.actions;
export const navigationSoapNoteReducer = navigationSoapNoteSlice.reducer;
