import { createSlice } from "@reduxjs/toolkit";

//import api from "services/api";

const initialState = {
  status: "idle",
  error: null,
  list: [],
};

const drugFormStatusSlice = createSlice({
  name: "drugFormStatus",
  initialState,
  reducers: {
    setDrugFormList(state, action) {
      state.list = action.payload;
    },
    updateDrugForm(state, action) {
      state.list[action.payload.id] = action.payload.data;
    },
  },
});

export const { setDrugFormList, updateDrugForm } = drugFormStatusSlice.actions;

export default drugFormStatusSlice.reducer;
