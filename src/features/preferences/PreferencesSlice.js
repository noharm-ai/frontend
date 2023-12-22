import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  prescription: {
    listType: "default",
  },
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setPrescriptionListType(state, action) {
      state.prescription.listType = action.payload;
    },
    reset() {
      return initialState;
    },
  },
});

export const { reset, setPrescriptionListType } = preferencesSlice.actions;

export default preferencesSlice.reducer;
