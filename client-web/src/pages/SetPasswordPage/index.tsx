// src/pages/SetPasswordPage/index.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@store/authSlice";
import { setTheme } from "@store/preferencesSlice";
import { RootState } from "@store/store";
import { logoutApi } from "@services/authApi";
import { useSetPasswordRequired } from "../../hooks/useSetPasswordRequired";
import { usePasswordToggle } from "@hooks/usePasswordToggle";
import styles from "./SetPasswordPage.module.scss";

const SetPasswordPage: React.FC = () => {
  console.log("🎯 SetPasswordPage component rendered");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.preferences.theme);

  const { form, errors, loading, handleChange, handleSubmit, user } =
    useSetPasswordRequired();

  const newPasswordToggle = usePasswordToggle();
  const confirmPasswordToggle = usePasswordToggle();

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      await logoutApi();
      dispatch(logout());
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Déconnexion forcée même en cas d'erreur
      dispatch(logout());
      navigate("/login", { replace: true });
    }
  };

  // Fonction de changement de thème
  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    dispatch(setTheme(newTheme));
    document.body.setAttribute("data-theme", newTheme);
  }; // Si l'utilisateur a déjà un mot de passe, rediriger
  React.useEffect(() => {
    console.log("🔍 SetPasswordPage - useEffect triggered");
    console.log("🔍 SetPasswordPage - user:", user);
    console.log(
      "🔍 SetPasswordPage - hasPassword type:",
      typeof user?.hasPassword
    );
    console.log("🔍 SetPasswordPage - hasPassword value:", user?.hasPassword);
    console.log(
      "🔍 SetPasswordPage - hasPassword === true:",
      user?.hasPassword === true
    );
    console.log(
      "🔍 SetPasswordPage - hasPassword === false:",
      user?.hasPassword === false
    );

    if (user?.hasPassword === true) {
      console.log(
        "🔄 SetPasswordPage - Redirecting to / because hasPassword is true"
      );
      navigate("/", { replace: true });
    } else {
      console.log(
        "✅ SetPasswordPage - Staying on page, hasPassword is:",
        user?.hasPassword
      );
    }
  }, [user?.hasPassword, navigate]);
  return (
    <section className={styles["setPasswordPage"]}>
      {" "}
      {/* Bouton de déconnexion */}
      <button
        className={styles["logoutButton"]}
        onClick={handleLogout}
        title="Se déconnecter"
      >
        <i className="fa-solid fa-sign-out-alt"></i>
        <span>Déconnexion</span>
      </button>
      <div className={styles["container"]}>
        {" "}
        <div className={styles["logoSection"]}>
          <img
            src="/assets/images/logo-supchat-complete-transparent-light-01.png"
            alt="Logo SupChat"
            className={styles["logo"]}
          />
          <div className={styles["welcomeMessage"]}>
            <h2>Bienvenue sur SupChat ! 👋</h2>
            <p>Finalisons votre inscription en sécurisant votre compte</p>
          </div>
        </div>
        <div className={styles["formCard"]}>
          <div className={styles["header"]}>
            <h1>Création de votre mot de passe</h1>
            <p className={styles["subtitle"]}>
              Vous vous êtes connecté via{" "}
              {user?.googleId ? "Google" : "Facebook"}.
              <br />
              Pour sécuriser votre compte et vous permettre de vous connecter
              avec votre email, veuillez créer un mot de passe.
            </p>
          </div>
          <div className={styles["infoBox"]}>
            <div className={styles["infoIcon"]}>🔐</div>
            <div className={styles["infoContent"]}>
              <h3>Pourquoi créer un mot de passe ?</h3>
              <ul>
                <li>Vous connecter avec votre email si besoin</li>
                <li>Sécuriser davantage votre compte</li>
                <li>Avoir une méthode de connexion de secours</li>
              </ul>
            </div>
          </div>
          <form onSubmit={handleSubmit} className={styles["form"]}>
            <div className={styles["field"]}>
              <label htmlFor="newPassword">Nouveau mot de passe</label>
              <div className={styles["passwordWrapper"]}>
                <input
                  type={newPasswordToggle.type}
                  id="newPassword"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  className={errors.newPassword ? styles["error"] : ""}
                  placeholder="Entrez votre mot de passe (min. 8 caractères)"
                  autoFocus
                />
                <button
                  type="button"
                  className={styles["eyeButton"]}
                  onMouseDown={() => newPasswordToggle.setShow(true)}
                  onMouseUp={() => newPasswordToggle.setShow(false)}
                  onMouseLeave={() => newPasswordToggle.setShow(false)}
                  aria-label={
                    newPasswordToggle.show
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {newPasswordToggle.show ? (
                    <i className="fa-solid fa-eye-slash"></i>
                  ) : (
                    <i className="fa-solid fa-eye"></i>
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <div className={styles["errorMessage"]}>
                  {errors.newPassword}
                </div>
              )}
            </div>
            <div className={styles["field"]}>
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <div className={styles["passwordWrapper"]}>
                <input
                  type={confirmPasswordToggle.type}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? styles["error"] : ""}
                  placeholder="Confirmez votre mot de passe"
                />
                <button
                  type="button"
                  className={styles["eyeButton"]}
                  onMouseDown={() => confirmPasswordToggle.setShow(true)}
                  onMouseUp={() => confirmPasswordToggle.setShow(false)}
                  onMouseLeave={() => confirmPasswordToggle.setShow(false)}
                  aria-label={
                    confirmPasswordToggle.show
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {confirmPasswordToggle.show ? (
                    <i className="fa-solid fa-eye-slash"></i>
                  ) : (
                    <i className="fa-solid fa-eye"></i>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className={styles["errorMessage"]}>
                  {errors.confirmPassword}
                </div>
              )}
            </div>{" "}
            <button type="submit" className="btn" disabled={loading}>
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Création du mot de passe...
                </>
              ) : (
                <>
                  <i className={`fa-solid fa-key ${styles["iconBtn"]}`}></i>
                  Créer mon mot de passe
                </>
              )}
            </button>
          </form>{" "}
          <div className={styles["footer"]}>
            {" "}
            {/* Bouton de changement de thème */}
            <button
              className={styles["themeToggle"]}
              onClick={handleThemeToggle}
              title={`Basculer vers le thème ${
                theme === "light" ? "sombre" : "clair"
              }`}
            >
              <i
                className={`fa-solid ${
                  theme === "light" ? "fa-moon" : "fa-sun"
                }`}
              ></i>
            </button>
            <p>
              Une fois votre mot de passe créé, vous pourrez vous connecter avec
              :
            </p>
            <div className={styles["authMethods"]}>
              <div className={styles["method"]}>
                <i className="fa-solid fa-envelope"></i>
                <span>Email + Mot de passe</span>
              </div>
              <div className={styles["method"]}>
                <i
                  className={`fa-brands fa-${
                    user?.googleId ? "google" : "facebook"
                  }`}
                ></i>
                <span>{user?.googleId ? "Google" : "Facebook"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SetPasswordPage;
