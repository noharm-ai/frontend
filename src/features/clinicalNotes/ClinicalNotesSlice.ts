import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import api from "services/api";

export interface IClinicalNoteItem {
  id: number;
  idPrescription: number;
  admissionNumber: number;
  notes: string;
  notesType: string | null;
  concilia: string | null;
  createdAt: string;
  updatedAt: string;
  userName: string;
  createdByName: string | null;
}

export interface IClinicalNotesUpsertParams {
  id?: number;
  idPrescription: number;
  idClinicalNoteType?: string | null;
  concilia?: string | null;
  tpStatus?: number;
  text?: string | null;
}

interface IClinicalNotesSlice {
  list: {
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    data: IClinicalNoteItem[];
  };
  save: {
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
  listModal: {
    open: boolean;
    idPrescription: number | null;
  };
  formModal: {
    open: boolean;
    selectedNote: IClinicalNoteItem | null;
  };
}

const initialState: IClinicalNotesSlice = {
  list: {
    status: "idle",
    error: null,
    data: [],
  },
  save: {
    status: "idle",
    error: null,
  },
  listModal: {
    open: false,
    idPrescription: null,
  },
  formModal: {
    open: false,
    selectedNote: null,
  },
};

export const fetchClinicalNotesByPrescription = createAsyncThunk(
  "clinicalNotes/list-by-prescription",
  async (idPrescription: number, thunkAPI) => {
    try {
      const response =
        await api.clinicalNotes.listByPrescription(idPrescription);
      return response.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.response?.data);
    }
  },
);

export const upsertClinicalNote = createAsyncThunk(
  "clinicalNotes/upsert",
  async (params: IClinicalNotesUpsertParams, thunkAPI) => {
    try {
      const response = await api.clinicalNotes.upsert(params);
      return response.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.response?.data);
    }
  },
);

const clinicalNotesMultiSlice = createSlice({
  name: "clinicalNotesMulti",
  initialState,
  reducers: {
    setListModalOpen(state, action: PayloadAction<{ idPrescription: number }>) {
      state.listModal.open = true;
      state.listModal.idPrescription = action.payload.idPrescription;
    },
    setListModalClose(state) {
      state.listModal.open = false;
      state.listModal.idPrescription = null;
      state.list.data = [];
      state.list.status = "idle";
      state.list.error = null;
    },
    setFormModalOpen(
      state,
      action: PayloadAction<{ selectedNote: IClinicalNoteItem | null }>,
    ) {
      state.formModal.open = true;
      state.formModal.selectedNote = action.payload.selectedNote;
    },
    setFormModalClose(state) {
      state.formModal.open = false;
      state.formModal.selectedNote = null;
      state.save.status = "idle";
      state.save.error = null;
    },
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchClinicalNotesByPrescription.pending, (state) => {
        state.list.status = "loading";
        state.list.error = null;
      })
      .addCase(fetchClinicalNotesByPrescription.fulfilled, (state, action) => {
        state.list.status = "succeeded";
        state.list.data = action.payload?.data ?? [];
      })
      .addCase(fetchClinicalNotesByPrescription.rejected, (state, action) => {
        state.list.status = "failed";
        state.list.error =
          (action.payload as any)?.message ?? "Erro ao carregar evoluções";
      })
      .addCase(upsertClinicalNote.pending, (state) => {
        state.save.status = "loading";
        state.save.error = null;
      })
      .addCase(upsertClinicalNote.fulfilled, (state) => {
        state.save.status = "succeeded";
      })
      .addCase(upsertClinicalNote.rejected, (state, action) => {
        state.save.status = "failed";
        state.save.error =
          (action.payload as any)?.message ?? "Erro ao salvar evolução";
      });
  },
});

export const {
  setListModalOpen,
  setListModalClose,
  setFormModalOpen,
  setFormModalClose,
  reset,
} = clinicalNotesMultiSlice.actions;

export default clinicalNotesMultiSlice.reducer;
