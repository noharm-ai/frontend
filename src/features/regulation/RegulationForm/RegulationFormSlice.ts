import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "services/regulation/api";

interface IRegulationForm {
  idPatient: number;
  birthdate?: string | null;
  idDepartment: number;
  solicitationDate: string;
  idRegSolicitationTypeList: number;
  risk: number;
  cid?: string;
  attendant?: string;
  attendantRecord?: string;
  justification: string;
}

interface IRegulationFormSlice {
  status: string;
  error: string | null;
  modal: boolean;
}

const initialState: IRegulationFormSlice = {
  status: "idle",
  error: null,
  modal: false,
};

export const createSolicitation = createAsyncThunk(
  "reg-form/create",
  async (params: IRegulationForm, thunkAPI) => {
    try {
      const response = await api.createSolicitation(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const regulationFormSlice = createSlice({
  name: "regulationFormSlice",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setRegulationFormModal(state, action) {
      state.modal = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(createSolicitation.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createSolicitation.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(createSolicitation.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { reset, setRegulationFormModal } = regulationFormSlice.actions;

export default regulationFormSlice.reducer;
