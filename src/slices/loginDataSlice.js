import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  username: null,
  email: null,
  password: null,
};

const loginDataSlice = createSlice({
  name: "loginData",
  initialState: initialState,
  reducers: {
    setData(state, action) {
      state.username = action.payload.username;
      state.password = action.payload.password;
      state.email = action.payload.email;
    },
  },
});

export const { setData } = loginDataSlice.actions;

export default loginDataSlice.reducer;
