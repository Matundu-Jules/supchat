// src/pages/LoginPage/LoginPage.tsx

import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import FacebookLogin from "@greatsumini/react-facebook-login";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@store/store";
import { setTheme } from "@store/preferencesSlice";

import { usePasswordToggle } from "@hooks/usePasswordToggle";
import { useLogin } from "@hooks/useLogin";

import styles from "./LoginPage.module.scss";

const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.preferences.theme);

  const {
    form,
    handleChange,
    handleSubmit,
    errors,
    loading,
    emailRef,
    passwordRef,
    handleGoogleSuccess,
    handleFacebookSuccess,
  } = useLogin();

  const { type: passwordType, show, setShow } = usePasswordToggle();

  // Fonction de changement de thème
  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    dispatch(setTheme(newTheme));
  };

  return (
    <section className={styles["login-page"]}>
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

      <div className={styles["logo-title"]}>
        <img
          src="/assets/images/logo-supchat-complete-transparent-light-01.png"
          alt="Logo de Supchat"
        />
      </div>
      <section className={styles["card-form"]}>
        <h1>Connexion</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            ref={emailRef}
            name="email"
            id="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className={errors.email ? "inputError" : ""}
            required
          />
          {errors.email && <div className="error">{errors.email}</div>}

          <label htmlFor="password">Mot de passe</label>
          <div className={styles["passwordInputWrapper"]}>
            <input
              ref={passwordRef}
              name="password"
              id="password"
              type={passwordType}
              placeholder="Mot de passe"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? "inputError" : ""}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              tabIndex={-1}
              className={styles["eyeButton"]}
              onMouseDown={() => setShow(true)}
              onMouseUp={() => setShow(false)}
              onMouseLeave={() => setShow(false)}
              aria-label={
                show ? "Masquer le mot de passe" : "Afficher le mot de passe"
              }
            >
              {show ? (
                <i className="fa-solid fa-eye-slash"></i>
              ) : (
                <i className="fa-solid fa-eye"></i>
              )}
            </button>
          </div>
          {errors.password && <div className="error">{errors.password}</div>}

          <button
            className={`btn ${styles["submit"]}`}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              "Connexion..."
            ) : (
              <>
                Connexion <i className="fa-solid fa-arrow-right"></i>
              </>
            )}
          </button>
        </form>{" "}
        <div className={styles["social-login"]}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert("Erreur lors de la connexion Google")}
          />
          <FacebookLogin
            appId={import.meta.env["VITE_FACEBOOK_APP_ID"]}
            onSuccess={handleFacebookSuccess}
            onFail={() => alert("Erreur lors de la connexion Facebook")}
            render={({ onClick }) => (
              <button className="facebook-button" onClick={onClick}>
                <i className="fa-brands fa-facebook-f"></i>Se connecter avec
                Facebook
              </button>
            )}
          />{" "}
        </div>{" "}
        <div className={styles["help-section"]}>
          <a href="/forgot-password">Mot de passe oublié ?</a>
        </div>
        <p className={styles["link-register"]}>
          Vous n'avez pas de compte ?
          <a href="/register" className={styles["link-create-account"]}>
            Créer un compte
          </a>
        </p>
      </section>
    </section>
  );
};

export default LoginPage;
