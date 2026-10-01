import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/api";

// page of the elements shown on every screen (header, menu, drawers)
export const GLOBAL_PAGE = "*";

export interface IHelpElementArticle {
  id: number;
  title: string;
  description: string | null;
}

export interface IHelpElement {
  // route pattern of the screen (e.g. /prescricao/:slug), or GLOBAL_PAGE
  page: string;
  selector: string;
  label: string | null;
  articles: IHelpElementArticle[];
}

export interface IHelpElementDraft {
  page: string;
  selector: string;
  label: string | null;
  articleIds: number[];
  // the selector does not rest on a stable attribute and may stop matching
  fragile: boolean;
  // editing an element already pinned (its page can no longer change)
  existing: boolean;
}

type Status = "idle" | "loading" | "succeeded" | "failed";

interface IHelpModeSlice {
  active: boolean;
  // curator picking an element to pin articles to
  picking: boolean;
  // route pattern of the current screen, null outside the routes map
  page: string | null;
  // elements of each screen visited, the global ones included
  byPage: Record<string, { status: Status; list: IHelpElement[] }>;
  editor: {
    draft: IHelpElementDraft | null;
    status: Status;
  };
}

const initialState: IHelpModeSlice = {
  active: false,
  picking: false,
  page: null,
  byPage: {},
  editor: { draft: null, status: "idle" },
};

export const fetchHelpElements = createAsyncThunk(
  "helpMode/fetch-elements",
  async (page: string, thunkAPI) => {
    try {
      const response = await api.knowledgeBase.getElements({ page });

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

export const saveHelpElement = createAsyncThunk(
  "helpMode/save-element",
  async (
    params: {
      page: string;
      selector: string;
      label: string | null;
      articleIds: number[];
    },
    thunkAPI,
  ) => {
    try {
      const response = await api.knowledgeBase.saveElement(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

const helpModeSlice = createSlice({
  name: "helpMode",
  initialState,
  reducers: {
    setHelpModePage(state, action: PayloadAction<string | null>) {
      state.page = action.payload;
    },
    setHelpModeActive(state, action: PayloadAction<boolean>) {
      state.active = action.payload;

      if (!action.payload) {
        state.picking = false;
      }
    },
    setHelpModePicking(state, action: PayloadAction<boolean>) {
      state.picking = action.payload;
    },
    openHelpElementEditor(state, action: PayloadAction<IHelpElementDraft>) {
      state.picking = false;
      state.editor = { draft: action.payload, status: "idle" };
    },
    closeHelpElementEditor(state) {
      state.editor = initialState.editor;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchHelpElements.pending, (state, action) => {
        const current = state.byPage[action.meta.arg];

        // keep what is on screen while a refresh runs
        state.byPage[action.meta.arg] = {
          status: "loading",
          list: current?.list ?? [],
        };
      })
      .addCase(fetchHelpElements.fulfilled, (state, action) => {
        state.byPage[action.meta.arg] = {
          status: "succeeded",
          list: action.payload.data,
        };
      })
      .addCase(fetchHelpElements.rejected, (state, action) => {
        state.byPage[action.meta.arg] = { status: "failed", list: [] };
      })
      .addCase(saveHelpElement.pending, (state) => {
        state.editor.status = "loading";
      })
      .addCase(saveHelpElement.fulfilled, (state) => {
        state.editor = initialState.editor;
        // a global element shows on every screen: drop every cached screen
        state.byPage = {};
      })
      .addCase(saveHelpElement.rejected, (state) => {
        state.editor.status = "failed";
      });
  },
});

export const {
  setHelpModePage,
  setHelpModeActive,
  setHelpModePicking,
  openHelpElementEditor,
  closeHelpElementEditor,
} = helpModeSlice.actions;

export const helpModeReducer = helpModeSlice.reducer;
