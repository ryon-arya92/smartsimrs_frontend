// src/routes/PublicRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import useAutoLogout from "../hooks/useAutoLogout";

const PublicRoute = ({ children }) => {
   useAutoLogout(15);
  const isAuthenticated = !!sessionStorage.getItem("user"); // atau dari context/token

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

export default PublicRoute;
