import { Navigate, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";
import PublicRoute from "./components/Auth/PublicRoute";
import PrivateRoute from "./components/Auth/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import AlbumShare from "./pages/AlbumShare";
import Otp from "./pages/Otp";
import Forgot from "./pages/Forgot";
import Reset from "./pages/Reset";

function App() {
  return (
    <div>
      <Routes>
        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/register" />} />

        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<Otp />} />
          <Route path="/forgot-password" element={<Forgot />} />
          <Route path="/reset-password" element={<Reset />} />
        </Route>

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Route>

        {/* Public (no auth needed) */}
        <Route path="/album/:id" element={<AlbumShare />} />
        <Route path="/album/:id/folder/:folderId/*" element={<AlbumShare />} />

        {/* 404 */}
        <Route path="/404" element={<div>404 Not Found</div>} />
        <Route path="*" element={<Navigate to="/404" />} />
      </Routes>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#222",
            color: "#fff",
            fontSize: "24px",
            fontWeight: "500",
            padding: "10px 10px",
            borderRadius: "16px",
          },
        }}
      />
    </div>
  );
}

export default App;
