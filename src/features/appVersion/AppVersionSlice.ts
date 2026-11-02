import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IAppVersionSlice {
  // a deploy newer than the code running in this tab is live
  updateAvailable: boolean;
  // build id of that deploy (meta app-build of the served index.html)
  deployedBuild: string | null;
}

const initialState: IAppVersionSlice = {
  updateAvailable: false,
  deployedBuild: null,
};

const appVersionSlice = createSlice({
  name: "appVersion",
  initialState,
  reducers: {
    setUpdateAvailable(state, action: PayloadAction<string>) {
      state.updateAvailable = true;
      state.deployedBuild = action.payload;
    },
  },
});

export const { setUpdateAvailable } = appVersionSlice.actions;

export const appVersionReducer = appVersionSlice.reducer;
