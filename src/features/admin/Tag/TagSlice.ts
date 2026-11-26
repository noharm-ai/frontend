import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/admin/api";

/** A tag as listed and saved by the admin tag endpoints. */
export interface ITag {
  name: string;
  tagType: number;
  active: boolean;
}

/** The tag open in the form; `new` marks one not saved yet. */
export interface ITagFormData extends Partial<ITag> {
  new?: boolean;
}

export interface ITagFilterParams {
  active?: boolean | null;
}

interface ITagSlice {
  list: ITag[];
  status: string;
  error: string | null;
  single: {
    data: ITagFormData | null;
    status: string;
    error: string | null;
  };
}

const initialState: ITagSlice = {
  list: [],
  status: "idle",
  error: null,
  single: {
    data: null,
    status: "idle",
    error: null,
  },
};

export const fetchTags = createAsyncThunk(
  "admin-tag/fetch",
  async (params: ITagFilterParams, thunkAPI) => {
    try {
      const response = await api.tag.getTags(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

export const upsertTag = createAsyncThunk(
  "admin-tag/upsert",
  async (params: ITagFormData, thunkAPI) => {
    try {
      const response = await api.tag.upsertTag(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

const tagSlice = createSlice({
  name: "adminTag",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setTag(state, action: PayloadAction<ITagFormData | null>) {
      state.single.data = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchTags.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data.data;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      })
      .addCase(upsertTag.pending, (state) => {
        state.single.status = "loading";
      })
      .addCase(upsertTag.fulfilled, (state, action) => {
        state.single.status = "succeeded";
        const record: ITag = action.payload.data;

        const index = state.list.findIndex(
          (i) => i.name === record.name && i.tagType === record.tagType,
        );
        if (index !== -1) {
          state.list[index] = record;
        } else {
          state.list.push(record);
        }
      })
      .addCase(upsertTag.rejected, (state, action) => {
        state.single.status = "failed";
        state.single.error = action.error.message ?? null;
      });
  },
});

export const { reset, setTag } = tagSlice.actions;

export default tagSlice.reducer;
