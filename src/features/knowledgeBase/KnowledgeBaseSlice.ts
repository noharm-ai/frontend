import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/api";
import { KnowledgeBaseSectionEnum } from "models/KnowledgeBaseSectionEnum";

export interface ITrainingLesson {
  id: number;
  title: string;
  trainingId: number;
  trainingTitle: string;
}

// outcome of writing an article to the n0 agent vector index
export type VectorIndexStatus = "indexed" | "removed" | "disabled" | "failed";

export interface IKnowledgeBaseArticle {
  id: number;
  title: string;
  description: string | null;
  path: string[];
  section: string[];
  trainingItems: number[];
  link: string | null;
  active: boolean;
  hasContent: boolean;
  content?: string | null;
  // resolved lessons (only on a single article)
  trainingLessons?: ITrainingLesson[];
  vectorIndex?: VectorIndexStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface IKnowledgeBaseFilters {
  term?: string | null;
  active?: boolean | null;
  path?: string[];
  section?: string[];
}

interface IKnowledgeBaseSlice {
  list: IKnowledgeBaseArticle[];
  status: string;
  error: string | null;
  filters: IKnowledgeBaseFilters;
  // active articles pinned to a section, shared by every section help icon
  sectionArticles: {
    list: IKnowledgeBaseArticle[];
    status: string;
  };
}

const initialState: IKnowledgeBaseSlice = {
  list: [],
  status: "idle",
  error: null,
  filters: {},
  sectionArticles: {
    list: [],
    status: "idle",
  },
};

export const fetchKnowledgeBaseArticles = createAsyncThunk(
  "knowledge-base/fetch",
  async (params: IKnowledgeBaseFilters, thunkAPI) => {
    try {
      const response = await api.knowledgeBase.list(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

export const fetchSectionArticles = createAsyncThunk(
  "knowledge-base/fetch-sections",
  async (_: void, thunkAPI) => {
    try {
      const response = await api.support.fetchKnowledgeBaseArticles({
        active: true,
        section: KnowledgeBaseSectionEnum.getList().map((s) => s.value),
      });

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
  {
    // every section icon of a screen asks for the list: fetch it only once
    condition: (_, { getState }) =>
      (getState() as any).knowledgeBase.sectionArticles.status === "idle",
  },
);

export const upsertKnowledgeBaseArticle = createAsyncThunk(
  "knowledge-base/upsert",
  async (params: any, thunkAPI) => {
    try {
      const response = await api.knowledgeBase.upsert(params);

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
    reset() {
      return initialState;
    },
    setFilters(state, action) {
      state.filters = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchKnowledgeBaseArticles.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchKnowledgeBaseArticles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data;
      })
      .addCase(fetchKnowledgeBaseArticles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      })
      .addCase(fetchSectionArticles.pending, (state) => {
        state.sectionArticles.status = "loading";
      })
      .addCase(fetchSectionArticles.fulfilled, (state, action) => {
        state.sectionArticles.status = "succeeded";
        state.sectionArticles.list = action.payload.data;
      })
      .addCase(fetchSectionArticles.rejected, (state) => {
        state.sectionArticles.status = "failed";
        state.sectionArticles.list = [];
      })
      .addCase(upsertKnowledgeBaseArticle.fulfilled, (state, action) => {
        const record: IKnowledgeBaseArticle = action.payload.data;
        const {
          content: _content,
          trainingLessons: _lessons,
          vectorIndex: _index,
          ...summary
        } = record;

        const index = state.list.findIndex((item) => item.id === record.id);
        if (index !== -1) {
          state.list[index] = summary;
        } else {
          state.list.push(summary);
          state.list.sort((a, b) => a.title.localeCompare(b.title));
        }

        // section icons pick the change up on their next render
        state.sectionArticles.status = "idle";
      });
  },
});

export const { reset, setFilters } = knowledgeBaseSlice.actions;

export default knowledgeBaseSlice.reducer;
