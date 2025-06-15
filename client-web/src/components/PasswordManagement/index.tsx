// src/components/PasswordManagement/index.tsx

import React from "react";
import { usePasswordManagement } from "@hooks/usePasswordManagement";
import { usePasswordToggle } from "@hooks/usePasswordToggle";
import styles from "./PasswordManagement.module.scss";

const PasswordManagement: React.FC = () => {
  const {
    form,
    errors,
    loading,
    success,
    hasPassword,
    handleChange,
    handleSubmit,
    reset,
  } = usePasswordManagement();

  const currentPasswordToggle = usePasswordToggle();
  const newPasswordToggle = usePasswordToggle();
  const confirmPasswordToggle = usePasswordToggle();
  return (
    <div className={styles["passwordManagement"]}>
      <div className={styles["header"]}>
        <h3>
          {hasPassword ? "Modifier le mot de passe" : "Définir un mot de passe"}
        </h3>
        {!hasPassword && (
          <p className={styles["socialInfo"]}>
            Vous vous êtes connecté via Google/Facebook. Définissez un mot de
            passe pour pouvoir vous connecter avec votre email.
          </p>
        )}
      </div>

      {success && (
        <div className={styles["successMessage"]}>
          <i className="fa-solid fa-check-circle"></i>
          {hasPassword
            ? "Mot de passe modifié avec succès !"
            : "Mot de passe défini avec succès ! Vous pouvez maintenant vous connecter avec votre email."}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles["form"]}>
        {hasPassword && (
          <div className={styles["field"]}>
            <label htmlFor="currentPassword">Mot de passe actuel</label>
            <div className={styles["passwordWrapper"]}>
              <input
                type={currentPasswordToggle.type}
                id="currentPassword"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                className={errors.currentPassword ? styles["error"] : ""}
                placeholder="Entrez votre mot de passe actuel"
              />
              <button
                type="button"
                className={styles["eyeButton"]}
                onMouseDown={() => currentPasswordToggle.setShow(true)}
                onMouseUp={() => currentPasswordToggle.setShow(false)}
                onMouseLeave={() => currentPasswordToggle.setShow(false)}
                aria-label={
                  currentPasswordToggle.show
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {currentPasswordToggle.show ? (
                  <i className="fa-solid fa-eye-slash"></i>
                ) : (
                  <i className="fa-solid fa-eye"></i>
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <div className={styles["errorMessage"]}>
                {errors.currentPassword}
              </div>
            )}
          </div>
        )}

        <div className={styles["field"]}>
          <label htmlFor="newPassword">
            {hasPassword ? "Nouveau mot de passe" : "Mot de passe"}
          </label>
          <div className={styles["passwordWrapper"]}>
            <input
              type={newPasswordToggle.type}
              id="newPassword"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className={errors.newPassword ? styles["error"] : ""}
              placeholder={
                hasPassword
                  ? "Entrez votre nouveau mot de passe"
                  : "Entrez votre mot de passe"
              }
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
            <div className={styles["errorMessage"]}>{errors.newPassword}</div>
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
        </div>

        <div className={styles["actions"]}>
          <button
            type="button"
            onClick={reset}
            className={`btn-secondary ${styles["resetButton"]}`}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className={`btn ${styles["submitButton"]}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                {hasPassword ? "Modification..." : "Définition..."}
              </>
            ) : (
              <>
                <i className="fa-solid fa-key"></i>
                {hasPassword
                  ? "Modifier le mot de passe"
                  : "Définir le mot de passe"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordManagement;
