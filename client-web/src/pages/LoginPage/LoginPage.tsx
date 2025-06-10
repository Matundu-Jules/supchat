// src/pages/LoginPage/LoginPage.tsx

import React from "react";

import { usePasswordToggle } from "@hooks/usePasswordToggle";
import { useLogin } from "@hooks/useLogin";

import styles from "./LoginPage.module.scss";

const LoginPage: React.FC = () => {
  const {
    form,
    handleChange,
    handleSubmit,
    errors,
    loading,
    emailRef,
    passwordRef,
  } = useLogin();

  const { type: passwordType, show, setShow } = usePasswordToggle();

  return (
    <section className={styles["login-page"]}>
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
        </form>

        <div className={styles["social-login"]}>
          <button className="gsi-material-button">
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  style={{ display: "block" }}
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents">
                Se connecter avec Google
              </span>
              <span style={{ display: "none" }}>Se connecter avec Google</span>
            </div>
          </button>

          <button className="facebook-button">
            <i className="fa-brands fa-facebook-f"></i>Se connecter avec
            Facebook
          </button>
        </div>

        <a href="/forgot-password">Mot de passe oublié ?</a>
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
