import React, { useEffect, useState, useCallback } from "react";
import { usePasswordManagement } from "@hooks/usePasswordManagement";
import { usePasswordToggle } from "@hooks/usePasswordToggle";
import styles from "./PasswordChangeModal.module.scss";

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  isOpen,
  onClose,
}) => {
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
  const confirmPasswordToggle = usePasswordToggle(); // État pour le compteur de fermeture automatique
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleModalClose = useCallback(() => {
    reset();
    setCountdown(null);
    onClose();
  }, [reset, onClose]); // Fermer automatiquement la modal après succès avec compteur
  useEffect(() => {
    if (!success) return;

    console.log("Starting countdown..."); // Debug
    setCountdown(3);

    const timer1 = setTimeout(() => {
      console.log("Countdown: 2"); // Debug
      setCountdown(2);
    }, 1000);

    const timer2 = setTimeout(() => {
      console.log("Countdown: 1"); // Debug
      setCountdown(1);
    }, 2000);

    const timer3 = setTimeout(() => {
      console.log("Countdown: 0"); // Debug
      setCountdown(0);
    }, 3000);

    const timer4 = setTimeout(() => {
      console.log("Closing modal..."); // Debug
      // Appeler directement les fonctions sans dépendances
      setCountdown(null);
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [success]); // SEULEMENT success comme dépendance

  // UseEffect séparé pour fermer la modale quand countdown atteint 0
  useEffect(() => {
    if (countdown === 0) {
      setTimeout(() => {
        reset();
        onClose();
      }, 500); // Petit délai pour laisser voir le 0
    }
  }, [countdown, reset, onClose]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
  };

  if (!isOpen) return null;

  return (
    <div className={styles["modalOverlay"]} onClick={handleModalClose}>
      <div
        className={styles["modalContent"]}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles["modalHeader"]}>
          <h2>
            🔑{" "}
            {hasPassword
              ? "Changer le mot de passe"
              : "Définir un mot de passe"}
          </h2>
          <button
            type="button"
            onClick={handleModalClose}
            className={styles["closeButton"]}
            aria-label="Fermer"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>{" "}
        <div className={styles["modalBody"]}>
          {!success && (
            <>
              {hasPassword ? (
                <p className={styles["description"]}>
                  Entrez votre mot de passe actuel puis choisissez un nouveau
                  mot de passe.
                </p>
              ) : (
                <p className={styles["description"]}>
                  Vous n'avez pas encore de mot de passe. Créez-en un pour
                  pouvoir vous connecter avec votre email.
                </p>
              )}
            </>
          )}

          {success && (
            <div className={styles["successMessage"]}>
              <i className="fa-solid fa-check-circle"></i>
              <div>
                {hasPassword
                  ? "Mot de passe modifié avec succès !"
                  : "Mot de passe défini avec succès ! Vous pouvez maintenant vous connecter avec votre email."}
                <br />{" "}
                <small>
                  {countdown !== null && countdown > 0
                    ? `Cette fenêtre se fermera dans ${countdown} seconde${
                        countdown > 1 ? "s" : ""
                      }...`
                    : "Fermeture en cours..."}
                </small>
              </div>{" "}
            </div>
          )}

          {!success && (
            <form onSubmit={handleFormSubmit} className={styles["form"]}>
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
                    placeholder="Entrez votre nouveau mot de passe (min. 8 caractères)"
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
                <label htmlFor="confirmPassword">
                  Confirmer le mot de passe
                </label>
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

              <div className={styles["formActions"]}>
                <button
                  type="submit"
                  disabled={loading}
                  className={styles["btnPrimary"]}
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      {hasPassword ? "Modification..." : "Création..."}
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-key"></i>
                      {hasPassword
                        ? "Modifier le mot de passe"
                        : "Créer le mot de passe"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleModalClose}
                  className={styles["btnSecondary"]}
                  disabled={loading}
                >
                  Annuler
                </button>{" "}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeModal;
