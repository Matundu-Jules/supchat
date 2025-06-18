// src/components/PublicRoute/PublicRoute.tsx

import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@store/store";
import Loader from "@components/Loader";

const PublicRoute: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const authLoading = useSelector((state: RootState) => state.auth.isLoading);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  if (authLoading) {
    return <Loader />;
  }  // Si l'utilisateur est connecté via Google/Facebook mais n'a pas de mot de passe,
  // le rediriger vers /set-password
  if (
    user &&
    (user.googleId || user.facebookId) &&
    user.hasPassword === false
  ) {
    return <Navigate to="/set-password" replace />;
  }

  // Si l'utilisateur est connecté normalement, rediriger vers les workspaces
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Sinon, autoriser l'affichage de la page publique (login/register/etc)
  return <Outlet />;
};

export default PublicRoute;
