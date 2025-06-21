// src/pages/ResetPasswordPage/ResetPasswordPage.tsx

import React from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@store/store";
import { setTheme } from "@store/preferencesSlice";
import { useResetPassword } from "@hooks/useResetPassword";
import { usePasswordToggle } from "@hooks/usePasswordToggle";
import styles from "./ResetPasswordPage.module.scss";

const ResetPasswordPage: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.preferences.theme);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    msg,
    isError,
    loading,
    handleSubmit,
    errors,
  } = useResetPassword(token);

  const passwordToggle = usePasswordToggle();
  const confirmToggle = usePasswordToggle();

  // Fonction de changement de thème
  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    dispatch(setTheme(newTheme));
  };

  if (!token) return <p>Token manquant ou invalide.</p>;

  return (
    <section className={styles["reset-password-page"]}>
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

      <h1>Réinitialiser mon mot de passe</h1>
      <form onSubmit={handleSubmit} autoComplete="off">
        <label htmlFor="password">Nouveau mot de passe</label>
        <div className={styles["passwordInputWrapper"]}>
          <input
            name="password"
            id="password"
            type={passwordToggle.type}
            placeholder="Nouveau mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={errors.password ? "inputError" : ""}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            tabIndex={-1}
            className={styles["eyeButton"]}
            onMouseDown={() => passwordToggle.setShow(true)}
            onMouseUp={() => passwordToggle.setShow(false)}
            onMouseLeave={() => passwordToggle.setShow(false)}
            aria-label={
              passwordToggle.show
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
          >
            {passwordToggle.show ? (
              <i className="fa-solid fa-eye-slash"></i>
            ) : (
              <i className="fa-solid fa-eye"></i>
            )}
          </button>
        </div>
        {errors.password && <div className="error">{errors.password}</div>}

        <label htmlFor="confirm-password">Confirmer le mot de passe</label>
        <div className={styles["passwordInputWrapper"]}>
          <input
            type={confirmToggle.type}
            id="confirm-password"
            value={confirmPassword}
            placeholder="Confirmez votre nouveau mot de passe"
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={errors.confirm ? "inputError" : ""}
          />
          <button
            type="button"
            tabIndex={-1}
            className={styles["eyeButton"]}
            onMouseDown={() => confirmToggle.setShow(true)}
            onMouseUp={() => confirmToggle.setShow(false)}
            onMouseLeave={() => confirmToggle.setShow(false)}
            aria-label={
              confirmToggle.show
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
          >
            {confirmToggle.show ? (
              <i className="fa-solid fa-eye-slash"></i>
            ) : (
              <i className="fa-solid fa-eye"></i>
            )}
          </button>
        </div>
        {errors.confirm && <div className="error">{errors.confirm}</div>}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Réinitialisation..." : "Changer mon mot de passe"}
        </button>
      </form>
      {msg && <p className={isError ? "error" : "success"}>{msg}</p>}

      <a href="/login">Revenir à l'accueil</a>
    </section>
  );
};

export default ResetPasswordPage;
