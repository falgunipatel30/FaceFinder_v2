import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import axios from "axios";
import { albumEndpoints } from "../services/apis";
import { setCurrentAlbum } from "./albumSlice";

// **Async Thunk to Fetch Album or Folder by ID**
export const fetchItem = createAsyncThunk(
  "currentItem/fetchItem",
  async ({ albumId, folderId }, { dispatch, rejectWithValue }) => {
    try {
      const url = albumEndpoints.GET_ALBUM;
      const response = await axios.post(
        url,
        {
          albumId: albumId,
          folderId: folderId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("response after adding", response);
      const item = response.data.curr;
      dispatch(setCurrentAlbum(item));
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch data"
      );
    }
  }
);

export const resetItemData = createAsyncThunk(
  "currentItem/resetItemData",
  async ({ albumId, folderId }, { dispatch }) => {
    dispatch(clearItemData()); // Clear current data
    await dispatch(fetchItem({ albumId, folderId })); // Fetch fresh data
  }
);

// **Initial State**
const initialState = {
  itemData: [], // Stores album or folder details
  folders: [], // Stores folders inside the album/folder
  loading: false,
  error: null,
};

// **Redux Slice**
const currentItemSlice = createSlice({
  name: "currentItem",
  initialState,
  reducers: {
    setItemData(state, action) {
      state.itemData = action.payload || [];
      //state.folders = action.payload.folders || []; // Set folders if available
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItem.fulfilled, (state, action) => {
        state.loading = false;
        state.itemData = action.payload.curr.images || [];
        state.folders = action.payload.curr.folders || []; // Set folders if available
      })
      .addCase(fetchItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// **Export Actions and Reducer**
export const { clearItemData, setItemData } = currentItemSlice.actions;
export default currentItemSlice.reducer;
