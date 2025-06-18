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

  // 🔍 DEBUG: Log de l'état d'authentification
  console.log("[PublicRoute] État auth:", {
    user: user ? { name: user.name, email: user.email } : null,
    authLoading,
    isAuthenticated,
  });

  if (authLoading) {
    console.log("[PublicRoute] En cours de chargement...");
    return <Loader />;
  }
  // Si l'utilisateur est connecté via Google/Facebook mais n'a pas de mot de passe,
  // le rediriger vers /set-password
  if (
    user &&
    (user.googleId || user.facebookId) &&
    user.hasPassword === false
  ) {
    console.log(
      "[PublicRoute] Redirection vers /set-password pour utilisateur OAuth sans mot de passe"
    );
    return <Navigate to="/set-password" replace />;
  }

  // Si l'utilisateur est connecté normalement, rediriger vers les workspaces
  if (user) {
    console.log("[PublicRoute] Utilisateur connecté, redirection vers /");
    return <Navigate to="/" replace />;
  }

  // Sinon, autoriser l'affichage de la page publique (login/register/etc)
  console.log("[PublicRoute] Autorisation d'accès à la route publique");
  return <Outlet />;
};

export default PublicRoute;
