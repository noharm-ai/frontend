import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/api";

export interface INewsSummary {
  id: number;
  // publication date (YYYY-MM-DD)
  date: string;
  title: string;
  description: string | null;
  hasContent: boolean;
}

export interface INews extends INewsSummary {
  content: string | null;
}

type Status = "idle" | "loading" | "succeeded" | "failed";

interface INewsSlice {
  list: {
    status: Status;
    data: INewsSummary[];
  };
  // contents loaded so far, by news id: a record is only fetched when opened
  contents: Record<number, { status: Status; content: string | null }>;
}

const initialState: INewsSlice = {
  list: { status: "idle", data: [] },
  contents: {},
};

export const fetchNewsList = createAsyncThunk(
  "news/fetch-list",
  async (_params: void, thunkAPI) => {
    try {
      const response = await api.news.getList();

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

export const fetchNewsContent = createAsyncThunk(
  "news/fetch-content",
  async (idNews: number, thunkAPI) => {
    try {
      const response = await api.news.get(idNews);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
  {
    // a record is fetched once; only a failed load is tried again
    condition: (idNews, { getState }) => {
      const loaded = (getState() as { news: INewsSlice }).news.contents[idNews];

      return !loaded || loaded.status === "failed";
    },
  },
);

const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchNewsList.pending, (state) => {
        state.list.status = "loading";
      })
      .addCase(fetchNewsList.fulfilled, (state, action) => {
        state.list.status = "succeeded";
        state.list.data = action.payload.data;
      })
      .addCase(fetchNewsList.rejected, (state) => {
        state.list.status = "failed";
        state.list.data = [];
      })
      .addCase(fetchNewsContent.pending, (state, action) => {
        state.contents[action.meta.arg] = { status: "loading", content: null };
      })
      .addCase(fetchNewsContent.fulfilled, (state, action) => {
        state.contents[action.meta.arg] = {
          status: "succeeded",
          content: action.payload.data.content,
        };
      })
      .addCase(fetchNewsContent.rejected, (state, action) => {
        state.contents[action.meta.arg] = { status: "failed", content: null };
      });
  },
});

export const newsReducer = newsSlice.reducer;
