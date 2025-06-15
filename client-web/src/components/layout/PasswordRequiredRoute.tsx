// src/components/layout/PasswordRequiredRoute.tsx

import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@store/store";

const PasswordRequiredRoute: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const location = useLocation();

  // Si l'utilisateur n'est pas connecté, laisser PrivateRoute gérer la redirection
  if (!user) {
    return <Outlet />;
  }

  // Si l'utilisateur est connecté via social login (Google ou Facebook)
  // et qu'il n'a pas de mot de passe défini
  // et qu'il n'est pas déjà sur la page de création de mot de passe
  if (
    (user.googleId || user.facebookId) &&
    user.hasPassword === false &&
    location.pathname !== "/set-password"
  ) {
    return <Navigate to="/set-password" replace />;
  }

  return <Outlet />;
};

export default PasswordRequiredRoute;
