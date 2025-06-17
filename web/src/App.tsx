// src/App.tsx

import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@store/store.ts";
import { useDispatch } from "react-redux";
import { setAuth, logout, setAuthLoading } from "@store/authSlice";
import { setTheme as setThemeAction } from "@store/preferencesSlice";
import { getCurrentUser } from "@services/authApi";
import { getProfile } from "@services/userApi";

import styles from "./App.module.scss";

import Header from "@components/layout/Header";
import Footer from "@components/layout/Footer";
import PrivateRoute from "@components/layout/PrivateRoute";
import PublicRoute from "@components/layout/PublicRoute";
import Loader from "@components/Loader";

import WorkspacePage from "@pages/WorkspacePage";
import MessagesPage from "@pages/MessagesPage";
import ChannelsPageWrapper from "@pages/ChannelsPage/wrapper";
import RegisterPage from "@pages/RegisterPage";
import LoginPage from "@pages/LoginPage";
import ForgotPasswordPage from "@pages/ForgotPasswordPage";
import ResetPasswordPage from "@pages/ResetPasswordPage";
import SetPasswordPage from "@pages/SetPasswordPage";
import WorkspaceDetailPage from "@pages/WorkspaceDetailPage";
import InviteWorkspacePage from "@pages/InviteWorkspacePage";
import SettingsPage from "@pages/SettingsPage";

const AppContent = ({
  theme,
  toggleTheme,
}: {
  theme: "light" | "dark";
  toggleTheme: () => void;
}) => {
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);

  // Vérifier si on est sur les pages Login ou Register
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/set-password";

  return (
    <div className={styles["appContainer"]}>
      {" "}
      {!isAuthPage && user && <Header />}
      <main className={styles["main-container"]}>
        <Routes>
          <Route path="/invite/:id" element={<InviteWorkspacePage />} />{" "}
          {/* Routes publiques protégées par PublicRoute */}
          <Route element={<PublicRoute />}>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>{" "}
          {/* Routes privées */}{" "}
          <Route element={<PrivateRoute />}>
            {/* Route pour la création obligatoire de mot de passe */}
            <Route path="/set-password" element={<SetPasswordPage />} />{" "}
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/workspaces/:id" element={<WorkspaceDetailPage />} />
            <Route path="/channels" element={<ChannelsPageWrapper />} />
            <Route path="/message" element={<MessagesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* Route par défaut - redirection vers workspace */}
            <Route index element={<WorkspacePage />} />
          </Route>
        </Routes>
      </main>
      <Footer theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
};

const App: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.preferences.theme);
  const authLoading = useSelector((state: RootState) => state.auth.isLoading);

  // Initialise theme from store
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]); // Vérifier l'authentification au chargement de l'app
  useEffect(() => {
    dispatch(setAuthLoading(true));
    getCurrentUser()
      .then(async (user) => {
        dispatch(setAuth(user));

        // Récupérer aussi le profil complet (avec avatar)
        try {
          const profile = await getProfile();
          dispatch(setAuth({ ...user, avatar: profile.avatar }));
        } catch (error) {
          // Erreur lors de la récupération du profil, continuer sans avatar
        }
      })
      .catch(() => {
        dispatch(logout());
      })
      .finally(() => {
        dispatch(setAuthLoading(false));
      });
  }, [dispatch]);
  // Fallback to prevent infinite loading if the API doesn't respond
  useEffect(() => {
    if (!authLoading) return;
    const timeout = setTimeout(() => {
      dispatch(setAuthLoading(false));
    }, 2000); // Réduit de 5s à 2s
    return () => clearTimeout(timeout);
  }, [authLoading, dispatch]);

  if (authLoading) {
    return <Loader />;
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    dispatch(setThemeAction(newTheme));
    document.body.setAttribute("data-theme", newTheme);
  };

  return (
    <Router>
      <AppContent theme={theme} toggleTheme={toggleTheme} />
    </Router>
  );
};

export default App;
