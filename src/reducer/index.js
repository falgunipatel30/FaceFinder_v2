import { combineReducers } from "@reduxjs/toolkit";
import authSlice from "../slices/authSlice";
import albumSlice from "../slices/albumSlice";
import currentItemSlice from "../slices/currentItemSlice";
import loginDataSlice from "../slices/loginDataSlice";
const rootReducer = combineReducers({
  auth: authSlice,
  albums: albumSlice,
  currentItem: currentItemSlice,
  loginData: loginDataSlice,
});

export default rootReducer;
