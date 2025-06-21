// src/pages/RegisterPage/RegisterPage.tsx

import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import FacebookLogin from "@greatsumini/react-facebook-login";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@store/store";
import { setTheme } from "@store/preferencesSlice";

import { usePasswordToggle } from "@hooks/usePasswordToggle";
import { useRegister } from "@hooks/useRegister";

import styles from "./RegisterPage.module.scss";

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.preferences.theme);

  const {
    form,
    handleChange,
    handleSubmit,
    errors,
    loading,
    nameRef,
    emailRef,
    passwordRef,
    handleGoogleSuccess,
    handleFacebookSuccess,
  } = useRegister();

  const { type: passwordType, show, setShow } = usePasswordToggle();

  // Fonction de changement de thème
  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    dispatch(setTheme(newTheme));
  };

  return (
    <section className={styles["register-page"]}>
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
          alt="Logo Supchat"
        />
      </div>
      <section className={styles["card-form"]}>
        <h1>Inscription</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Identifiant</label>
          <input
            ref={nameRef}
            id="name"
            name="name"
            type="text"
            placeholder="Identifiant"
            value={form.name}
            onChange={handleChange}
            className={errors.name ? "inputError" : ""}
            required
          />
          {errors.name && <div className="error">{errors.name}</div>}
          <label htmlFor="email">Adresse e-mail</label>
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className={errors.email ? "inputError" : ""}
            required
          />
          {errors.email && <div className="error">{errors.email}</div>}{" "}
          <label htmlFor="password">Mot de passe</label>
          <div className={styles["passwordInputWrapper"]}>
            <input
              ref={passwordRef}
              id="password"
              name="password"
              type={passwordType}
              placeholder="Mot de passe"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? "inputError" : ""}
              required
              autoComplete="new-password"
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
              "Chargement..."
            ) : (
              <>
                S’inscrire <i className="fa-solid fa-arrow-right" />
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
                <i className="fa-brands fa-facebook-f"></i>Continuer avec
                Facebook
              </button>
            )}
          />
        </div>
        <p className={styles["link-login"]}>
          Vous avez déjà un compte ?{" "}
          <a href="/login" className={styles["link-create-account"]}>
            Connectez-vous
          </a>
        </p>
      </section>
    </section>
  );
};

export default RegisterPage;
