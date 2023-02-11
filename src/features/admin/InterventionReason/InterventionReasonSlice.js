import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";

const initialState = {
  list: [],
  status: "idle",
  error: null,
};

export const fetchInterventionReasons = createAsyncThunk(
  "intervention-reason/fetch",
  async (params, thunkAPI) => {
    const { access_token } = thunkAPI.getState().auth.identify;

    const response = await api.getIntervReasonList(access_token);
    return response.data;
  }
);

// export const addNewPost = createAsyncThunk(
//   'posts/addNewPost',
//   async (initialPost) => {
//     const response = await client.post('/fakeApi/posts', initialPost)
//     return response.data
//   }
// )

const interventionReasonSlice = createSlice({
  name: "interventionReason",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchInterventionReasons.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchInterventionReasons.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data;
      })
      .addCase(fetchInterventionReasons.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
    // .addCase(addNewPost.fulfilled, (state, action) => {
    //   state.posts.push(action.payload)
    // })
  },
});

//export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions

export default interventionReasonSlice.reducer;

export const selectAllInterventionReasons = (state) =>
  state.admin.interventionReason.list;

// export const selectPostById = (state, postId) =>
//   state.posts.posts.find((post) => post.id === postId)
