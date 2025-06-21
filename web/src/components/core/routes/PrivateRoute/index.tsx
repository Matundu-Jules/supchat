// src/components/PrivateRoute/PrivateRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@store/store";
import Loader from "@components/core/ui/Loader";

const PrivateRoute: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const authLoading = useSelector((state: RootState) => state.auth.isLoading);
  const location = useLocation();

  if (authLoading) {
    return <Loader />;
  }

  // Si pas d'utilisateur connecté, rediriger vers login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur est connecté via Google/Facebook et n'a pas de mot de passe
  // ET qu'il n'est pas déjà sur la page /set-password, alors le rediriger
  if (
    user &&
    (user.googleId || user.facebookId) &&
    user.hasPassword === false &&
    location.pathname !== "/set-password"
  ) {
    return <Navigate to="/set-password" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
