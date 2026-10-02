import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/api";

export interface INews {
  id: number;
  // publication date (YYYY-MM-DD)
  date: string;
  title: string;
  description: string | null;
  hasContent: boolean;
  // news body, as HTML
  content: string | null;
}

type Status = "idle" | "loading" | "succeeded" | "failed";

// news per page of the list
export const NEWS_PAGE_SIZE = 5;

interface INewsSlice {
  list: {
    // first page
    status: Status;
    data: INews[];
    hasMore: boolean;
    // next pages, appended to data
    moreStatus: Status;
  };
}

const initialState: INewsSlice = {
  list: { status: "idle", data: [], hasMore: false, moreStatus: "idle" },
};

export const fetchNewsList = createAsyncThunk(
  "news/fetch-list",
  async (_params: void, thunkAPI) => {
    try {
      const response = await api.news.getList({
        limit: NEWS_PAGE_SIZE,
        offset: 0,
      });

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
  {
    // a load already on its way is not repeated
    condition: (_params, { getState }) =>
      (getState() as { news: INewsSlice }).news.list.status !== "loading",
  },
);

export const fetchMoreNews = createAsyncThunk(
  "news/fetch-more",
  async (_params: void, thunkAPI) => {
    const offset = (thunkAPI.getState() as { news: INewsSlice }).news.list.data
      .length;

    try {
      const response = await api.news.getList({
        limit: NEWS_PAGE_SIZE,
        offset,
      });

      return { offset, ...response.data.data };
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
  {
    // one page at a time, and only while there is a next one
    condition: (_params, { getState }) => {
      const { list } = (getState() as { news: INewsSlice }).news;

      return (
        list.status === "succeeded" &&
        list.hasMore &&
        list.moreStatus !== "loading"
      );
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
        state.list.moreStatus = "idle";
      })
      .addCase(fetchNewsList.fulfilled, (state, action) => {
        state.list.status = "succeeded";
        state.list.data = action.payload.data.news;
        state.list.hasMore = action.payload.data.hasMore;
      })
      .addCase(fetchNewsList.rejected, (state) => {
        state.list.status = "failed";
        state.list.data = [];
        state.list.hasMore = false;
      })
      .addCase(fetchMoreNews.pending, (state) => {
        state.list.moreStatus = "loading";
      })
      .addCase(fetchMoreNews.fulfilled, (state, action) => {
        // a page requested before the list was reloaded
        if (action.payload.offset !== state.list.data.length) return;

        // a news published meanwhile shifts the offsets: skip the repeated ones
        const ids = new Set(state.list.data.map((n) => n.id));
        state.list.data.push(
          ...action.payload.news.filter((n: INews) => !ids.has(n.id)),
        );
        state.list.hasMore = action.payload.hasMore;
        state.list.moreStatus = "succeeded";
      })
      .addCase(fetchMoreNews.rejected, (state) => {
        state.list.moreStatus = "failed";
      });
  },
});

export const newsReducer = newsSlice.reducer;
