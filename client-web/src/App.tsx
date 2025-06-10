// src/App.tsx

import React, { useEffect, useState } from "react";
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

import Header from "@components/Header/Header.tsx";
import Footer from "@components/Footer/Footer";
import PrivateRoute from "@components/PrivateRoute/PrivateRoute.tsx";
import PublicRoute from "@components/PublicRoute/PublicRoute";

import Dashboard from "@pages/Dashboard/Dashboard";
import WorkspacePage from "@pages/WorkspacePage/WorkspacePage";
import MessagesPage from "@pages/MessagesPage/MessagesPage";
import RegisterPage from "@pages/RegisterPage/RegisterPage";
import LoginPage from "@pages/LoginPage/LoginPage";
import ForgotPasswordPage from "@pages/ForgotPasswordPage/ForgotPasswordPage";
import ResetPasswordPage from "@pages/ResetPasswordPage/ResetPasswordPage";

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
          </Route>

          {/* Routes privées */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workspace" element={<WorkspacePage />} />
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

  // Retrieves the localStorage theme or prefers the system theme
  useEffect(() => {
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
      });
  }, [dispatch]);

  if (authLoading) {
    return <div className="loading">Chargement...</div>;
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
