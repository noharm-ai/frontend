import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/api";

const initialState = {
  list: [],
  status: "idle",
  error: null,
  single: {
    data: null,
    status: "idle",
    error: null,
  },
};

export const fetchUsers = createAsyncThunk(
  "user-admin/fetch",
  async (params, thunkAPI) => {
    try {
      const response = await api.userAdmin.getUsers(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const upsertUser = createAsyncThunk(
  "user-admin/upsert",
  async (params, thunkAPI) => {
    try {
      const response = await api.userAdmin.upsertUser(params);
      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const userAdminSlice = createSlice({
  name: "userAdmin",
  initialState,
  reducers: {
    setUser(state, action) {
      state.single.data = action.payload;
    },
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchUsers.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data.data;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(upsertUser.pending, (state, action) => {
        state.single.status = "loading";
      })
      .addCase(upsertUser.fulfilled, (state, action) => {
        state.single.status = "succeeded";

        const item = action.payload.data.data;

        const index = state.list.findIndex((i) => i.id === item.id);
        if (index !== -1) {
          state.list[index] = item;
        } else {
          state.list.push(item);
        }
      })
      .addCase(upsertUser.rejected, (state, action) => {
        state.single.status = "failed";
        state.single.error = action.error.message;
      });
  },
});

export const { reset, setUser } = userAdminSlice.actions;

export default userAdminSlice.reducer;
