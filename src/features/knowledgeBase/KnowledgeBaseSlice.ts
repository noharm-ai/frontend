import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/api";

export interface IKnowledgeBaseArticleSummary {
  id: number;
  title: string;
  description: string | null;
  // screens the article is pinned to, shown as categories
  path: string[];
  // external copy of the article (the old knowledge base)
  link: string | null;
  hasContent: boolean;
  updatedAt: string | null;
}

export interface IKnowledgeBaseSearchResult extends IKnowledgeBaseArticleSummary {
  // best matching chunk of the article
  snippet: string;
  // 1 - cosine distance: higher is closer
  score: number;
}

export interface IKnowledgeBaseArticle extends IKnowledgeBaseArticleSummary {
  content: string | null;
  related: { id: number; title: string; description: string | null }[];
  relatedLessons: {
    id: number;
    trainingId: number;
    title: string;
    trainingTitle: string;
  }[];
}

type Status = "idle" | "loading" | "succeeded" | "failed";

interface IKnowledgeBaseSlice {
  list: {
    status: Status;
    data: IKnowledgeBaseArticleSummary[];
  };
  search: {
    status: Status;
    // the query the results belong to, so stale results are never shown for
    // a newer query
    query: string;
    results: IKnowledgeBaseSearchResult[];
  };
  article: {
    status: Status;
    data: IKnowledgeBaseArticle | null;
  };
}

const initialState: IKnowledgeBaseSlice = {
  list: { status: "idle", data: [] },
  search: { status: "idle", query: "", results: [] },
  article: { status: "idle", data: null },
};

export const fetchKnowledgeBaseArticles = createAsyncThunk(
  "knowledgeBase/fetch-articles",
  async (_params: void, thunkAPI) => {
    try {
      const response = await api.knowledgeBase.getArticles();

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

export const fetchKnowledgeBaseArticle = createAsyncThunk(
  "knowledgeBase/fetch-article",
  async (idArticle: number, thunkAPI) => {
    try {
      const response = await api.knowledgeBase.getArticle(idArticle);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

export const searchKnowledgeBase = createAsyncThunk(
  "knowledgeBase/search",
  async (query: string, thunkAPI) => {
    try {
      const response = await api.knowledgeBase.search({ query });

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

const knowledgeBaseSlice = createSlice({
  name: "knowledgeBase",
  initialState,
  reducers: {
    clearSearch(state) {
      state.search = initialState.search;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchKnowledgeBaseArticles.pending, (state) => {
        state.list.status = "loading";
      })
      .addCase(fetchKnowledgeBaseArticles.fulfilled, (state, action) => {
        state.list.status = "succeeded";
        state.list.data = action.payload.data;
      })
      .addCase(fetchKnowledgeBaseArticles.rejected, (state) => {
        state.list.status = "failed";
        state.list.data = [];
      })
      .addCase(fetchKnowledgeBaseArticle.pending, (state) => {
        state.article.status = "loading";
      })
      .addCase(fetchKnowledgeBaseArticle.fulfilled, (state, action) => {
        state.article.status = "succeeded";
        state.article.data = action.payload.data;
      })
      .addCase(fetchKnowledgeBaseArticle.rejected, (state) => {
        state.article.status = "failed";
        state.article.data = null;
      })
      .addCase(searchKnowledgeBase.pending, (state, action) => {
        state.search.status = "loading";
        state.search.query = action.meta.arg;
      })
      .addCase(searchKnowledgeBase.fulfilled, (state, action) => {
        // a slower, older request must not overwrite the current query
        if (action.meta.arg !== state.search.query) return;

        state.search.status = "succeeded";
        state.search.results = action.payload.data;
      })
      .addCase(searchKnowledgeBase.rejected, (state, action) => {
        if (action.meta.arg !== state.search.query) return;

        state.search.status = "failed";
        state.search.results = [];
      });
  },
});

export const { clearSearch } = knowledgeBaseSlice.actions;

export const knowledgeBaseReducer = knowledgeBaseSlice.reducer;
