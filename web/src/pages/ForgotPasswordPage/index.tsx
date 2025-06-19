// src/pages/ForgotPasswordPage/ForgotPasswordPage.tsx

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@store/store";
import { setTheme } from "@store/preferencesSlice";
import { useForgotPassword } from "@hooks/useForgotPassword";
import styles from "./ForgotPasswordPage.module.scss";

const ForgotPasswordPage: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.preferences.theme);

  const { email, setEmail, msg, loading, handleSubmit, isError } =
    useForgotPassword();

  // Fonction de changement de thème
  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    dispatch(setTheme(newTheme));
  };

  return (
    <section className={styles["forgot-password-page"]}>
      {/* Bouton de changement de thème */}
      <button
        className={styles["themeToggle"]}
        onClick={handleThemeToggle}
        title={
          theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"
        }
        aria-label="Changer de thème"
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      <h1>Mot de passe oublié</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Ton email</label>
        <input
          type="email"
          id="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        {msg && <p className={isError ? "error" : "success"}>{msg}</p>}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Envoi..." : "Recevoir le lien de réinitialisation"}
        </button>
      </form>

      <a href="/login">Revenir à l'accueil</a>
    </section>
  );
};

export default ForgotPasswordPage;
