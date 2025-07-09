import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { albumEndpoints } from "../services/apis";

// Async thunk to fetch albums
export const fetchAlbums = createAsyncThunk(
  "albums/fetchAlbums",
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token; // Get token from auth state

    if (!token) {
      return rejectWithValue("No authentication token found.");
    }

    try {
      const response = await axios.post(
        albumEndpoints.ALL_ALBUM,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response) {
        throw new Error("Failed to fetch albums");
      }

      const data = await response.data;
      return { albums: data.albums, pinnedAlbums: data.pinnedAlbums }; // Assuming API returns `{ albums: [...] }`
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Initial state
const initialState = {
  albums: [],
  pinnedAlbums: [],
  loading: false,
  error: null,
  currentAlbum: null, // Stores album or folder details
};

const albumSlice = createSlice({
  name: "albums",
  initialState,
  reducers: {
    clearAlbums(state) {
      state.albums = [];
    },
    setPinnedAlbums(state, action) {
      state.pinnedAlbums = action.payload;
    },
    setAlbums(state, action) {
      state.albums = action.payload;
    },
    setCurrentAlbum(state, action) {
      state.currentAlbum = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlbums.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlbums.fulfilled, (state, action) => {
        state.loading = false;
        state.albums = action.payload.albums;
        state.pinnedAlbums = action.payload.pinnedAlbums;
      })
      .addCase(fetchAlbums.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAlbums, setCurrentAlbum, setPinnedAlbums, setAlbums } =
  albumSlice.actions;
export default albumSlice.reducer;
