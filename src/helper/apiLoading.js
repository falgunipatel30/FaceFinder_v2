import axios from "axios";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Optional: Customize NProgress
NProgress.configure({ showSpinner: false, speed: 500 });

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
});

// Show loading bar on request start
api.interceptors.request.use(
  (config) => {
    NProgress.start();
    return config;
  },
  (error) => {
    NProgress.done();
    return Promise.reject(error);
  }
);

// Hide loading bar on response
api.interceptors.response.use(
  (response) => {
    NProgress.done();
    return response;
  },
  (error) => {
    NProgress.done();
    return Promise.reject(error);
  }
);

export default api;
