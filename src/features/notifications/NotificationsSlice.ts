import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// shape of the items in the /authenticate response's `notifications`
export interface INotification {
  id: number | string;
  title: string;
  text: string;
  date?: string | null;
}

interface INotificationsSlice {
  list: INotification[];
}

const initialState: INotificationsSlice = {
  list: [],
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications(state, { payload }: PayloadAction<INotification[]>) {
      state.list = payload;
    },
    removeNotification(
      state,
      { payload: id }: PayloadAction<INotification["id"]>,
    ) {
      state.list = state.list.filter((n) => n.id !== id);
    },
  },
});

export const { setNotifications, removeNotification } =
  notificationsSlice.actions;

export default notificationsSlice.reducer;
