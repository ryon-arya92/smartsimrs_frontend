// components/PrivateRoute.js
import { Navigate, Outlet } from "react-router-dom";
import useAutoLogout from "../hooks/useAutoLogout";

const PrivateRoute = () => {
  useAutoLogout(60);
  const user = JSON.parse(sessionStorage.getItem("user"));

  // Kalau belum login, redirect ke halaman error
  if (!user || !user.email) {
    return <Navigate to="/errors/error404" />;
  }

  return <Outlet />; // Tampilkan konten route yang dibungkus
};

export default PrivateRoute;


