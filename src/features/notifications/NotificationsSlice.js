import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications(state, { payload }) {
      state.list = payload;
    },
    removeNotification(state, { payload: id }) {
      state.list = state.list.filter((n) => n.id !== id);
    },
  },
});

export const { setNotifications, removeNotification } =
  notificationsSlice.actions;

export default notificationsSlice.reducer;
