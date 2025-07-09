import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const PrivateRoute = () => {
  const { token } = useSelector((state) => state.auth);

  // Use useMemo to memoize the token validation logic
  const isValidToken = useMemo(() => {
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;
      return decoded.exp > now;
    } catch (err) {
      return false;
    }
  }, [token]);

  // Redirect to login if token is invalid or not present
  if (!isValidToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
