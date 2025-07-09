import { authEndpoints } from "../apis";
import { setLoading, setToken } from "../../slices/authSlice";
import axios from "axios";
import toast from "react-hot-toast";
import { setData } from "../../slices/loginDataSlice";

export const login = ({ user, password }, navigate) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const url = authEndpoints.LOGIN;

      const response = await axios.post(url, {
        user: user,
        password: password,
      });

      if (!response) {
        throw new Error("Failed to login");
      }

      localStorage.setItem("token", response.data.token);
      dispatch(setToken(response.data.token));
      toast.success("Logged in successfully");
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      error.response
        ? toast.error(error.response.data.message)
        : toast.error(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const register = ({ username, email, password, otp }, navigate) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const url = authEndpoints.REGISTER;
      const response = await axios.post(
        url,
        {
          username: username,
          email: email,
          password: password,
          otp: otp,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (!response || !response.status) {
        response === null
          ? toast.error(response.data.message)
          : toast.error("couldn't connect to server");
        throw new Error("Failed to login");
      }
      toast.success("Registered in successfully");
      navigate("/login");
    } catch (error) {
      console.log(error);
      error.response
        ? toast.error(error.response.data.message)
        : toast.error(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const sendOtp = ({ username, email, password }, navigate) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const url = authEndpoints.SEND_OTP;
      const response = await axios.post(
        url,
        {
          email: email,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (!response || !response.status) {
        response === null
          ? toast.error(response.data.message)
          : toast.error("couldn't connect to server");
        throw new Error("Failed to login");
      }
      const data = {
        email: email,
        username: username,
        password: password,
      };
      dispatch(setData(data));
      toast.success("OTP sent to your email");
      navigate("/verify");
    } catch (error) {
      console.log(error);
      error.response
        ? toast.error(error.response.data.message)
        : toast.error(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const resendOtp = async ({ email }) => {
  try {
    const url = authEndpoints.SEND_OTP;
    const response = await axios.post(
      url,
      {
        email: email,
      },
      { headers: { "Content-Type": "application/json" } }
    );

    if (!response || !response.status) {
      response === null
        ? toast.error(response.data.message)
        : toast.error("couldn't connect to server");
      throw new Error("Failed to login");
    }

    toast.success("OTP sent to your email");
  } catch (error) {
    console.log(error);
    error.response
      ? toast.error(error.response.data.message)
      : toast.error(error.message);
  }
};

export const forgotPass = ({ email }) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const url = authEndpoints.FORGOT_PASS;
      const response = await axios.post(
        url,
        {
          email: email,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (!response || !response.status) {
        response === null
          ? toast.error(response.data.message)
          : toast.error("couldn't connect to server");
        throw new Error("Failed to login");
      }

      toast.success("Check your email for reset password link");
    } catch (error) {
      console.log(error);
      error.response
        ? toast.error(error.response.data.message)
        : toast.error(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const resetPass = ({ token, newPassword }, navigate) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const url = authEndpoints.RESET_PASS;
      const response = await axios.post(
        url,
        {
          token: token,
          newPassword: newPassword,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (!response || !response.status) {
        response === null
          ? toast.error(response.data.message)
          : toast.error("couldn't connect to server");
        throw new Error("Failed to login");
      }

      toast.success("Password reset successfully");
      navigate("/login");
    } catch (error) {
      console.log(error);
      error.response
        ? toast.error(error.response.data.message)
        : toast.error(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const logout = () => {
  return (dispatch) => {
    localStorage.removeItem("token");
    dispatch(setToken(null));
    toast.success("Logged out successfully");
  };
};
