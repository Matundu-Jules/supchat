// src/App.tsx

import React, { useEffect, useState, useRef } from "react";
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
import { getCurrentUser } from "@services/authApi";

import styles from "./App.module.scss";

import Header from "@components/layout/Header";
import Footer from "@components/layout/Footer";
import PrivateRoute from "@components/layout/PrivateRoute";
import PublicRoute from "@components/layout/PublicRoute";
import Loader from "@components/Loader";

import Dashboard from "@pages/Dashboard";
import WorkspacePage from "@pages/WorkspacePage";
import MessagesPage from "@pages/MessagesPage";
import RegisterPage from "@pages/RegisterPage";
import LoginPage from "@pages/LoginPage";
import ForgotPasswordPage from "@pages/ForgotPasswordPage";
import ResetPasswordPage from "@pages/ResetPasswordPage";
import WorkspaceDetailPage from "@pages/WorkspaceDetailPage";
import InvitePage from "@pages/InviteWorkspacePage";

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
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className={styles["appContainer"]}>
      {!isAuthPage && user && (
        <Header theme={theme} toggleTheme={toggleTheme} />
      )}
      <main className={styles["main-container"]}>
        <Routes>
          {/* Routes publiques protégées par PublicRoute */}
          <Route element={<PublicRoute />}>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/invite/:id" element={<InvitePage />} />
          </Route>

          {/* Routes privées */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/workspaces/:id" element={<WorkspaceDetailPage />} />
            <Route path="/message" element={<MessagesPage />} />
          </Route>
        </Routes>
      </main>

      <Footer theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const dispatch = useDispatch();
  const authLoading = useSelector((state: RootState) => state.auth.isLoading);
  const authChecked = useRef(false);

  // Retrieves the localStorage theme or prefers the system theme
  useEffect(() => {
    if (authChecked.current) {
      return;
    }
    authChecked.current = true;
    const storedTheme = localStorage.getItem("theme") as
      | "light"
      | "dark"
      | null;
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialTheme = storedTheme || (systemPrefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.body.setAttribute("data-theme", initialTheme);

    dispatch(setAuthLoading(true));
    getCurrentUser()
      .then((user) => {
        dispatch(setAuth(user));
      })
      .catch(() => {
        dispatch(logout());
      })
      .finally(() => {
        dispatch(setAuthLoading(false));
      });
  }, [dispatch]);

  if (authLoading) {
    return <Loader />;
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <Router>
      <AppContent theme={theme} toggleTheme={toggleTheme} />
    </Router>
  );
};

export default App;
