const BASE_URL = process.env.REACT_APP_BASE_URL;

export const authEndpoints = {
  LOGIN: BASE_URL + "/auth/login",
  REGISTER: BASE_URL + "/auth/register",
  SEND_OTP: BASE_URL + "/auth/send-otp",
  FORGOT_PASS: BASE_URL + "/auth/forgot-password",
  RESET_PASS: BASE_URL + "/auth/reset-password",
};

export const albumEndpoints = {
  ADD_ALBUM: BASE_URL + "/album/addAlbum",
  ADD_IMAGES: BASE_URL + "/album/addImages",
  DELETE_ALBUM: BASE_URL + "/album/deleteAlbum",
  DELETE_IMAGE: BASE_URL + "/album/deleteImage",
  PIN_ALBUM: BASE_URL + "/album/pin",
  UNPIN_ALBUM: BASE_URL + "/album/unpin",
  SEARCH_IMAGE: BASE_URL + "/album/searchImage",
  RATIO_CHANGE: BASE_URL + "/album/editRatio",
  CREATE_FOLDER: BASE_URL + "/album/createFolder",
  GET_ALBUM: BASE_URL + "/album/getAlbum",
  ALL_ALBUM: BASE_URL + "/album/all",
  DELETE_FOLDER: BASE_URL + "/album/deleteFolder",
  MERGE_AND_DELETE_FOLDER: BASE_URL + "/album/mergeAndDeleteFolder",
  GET_FOLDER_BREADCRUMB: BASE_URL + "/album/breadcrumb",
};
