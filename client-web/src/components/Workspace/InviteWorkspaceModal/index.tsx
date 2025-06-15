import React, { useState, useEffect } from "react";
import styles from "./InviteWorkspaceModal.module.scss";

interface InviteWorkspaceModalProps {
  workspace: {
    _id: string;
    name: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  success?: string | null;
  onClearMessages?: () => void;
}

const InviteWorkspaceModal: React.FC<InviteWorkspaceModalProps> = ({
  workspace,
  isOpen,
  onClose,
  onInvite,
  loading = false,
  error = null,
  success = null,
  onClearMessages,
}) => {
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setLocalError("L'adresse email est requise");
      return;
    }
    if (!emailRegex.test(email)) {
      setLocalError("Veuillez saisir une adresse email valide");
      return;
    }
    setLocalError("");

    try {
      await onInvite(email);
      // Ne pas fermer automatiquement pour laisser voir le message de succès
    } catch (err) {
      // L'erreur sera gérée par le parent
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    // Nettoyer les erreurs locales quand l'utilisateur tape
    if (localError) {
      setLocalError("");
    }

    // Nettoyer les messages du parent
    if (onClearMessages && (error || success)) {
      onClearMessages();
    }
  };

  const handleClose = () => {
    setEmail("");
    setLocalError("");
    onClose();
  };

  // Reset l'email quand la modale s'ouvre avec un nouveau workspace
  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setLocalError("");
    }
  }, [isOpen, workspace._id]);

  if (!isOpen) return null;

  const displayError = localError || error;

  return (
    <div className={styles["modalOverlay"]}>
      <div className={styles["modalContainer"]}>
        <div className={styles["modalHeader"]}>
          <div className={styles["headerContent"]}>
            <h2 className={styles["modalTitle"]}>Inviter un membre</h2>
            <p className={styles["workspaceName"]}>dans {workspace.name}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className={styles["closeButton"]}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles["modalForm"]}>
          <div className={styles["formGroup"]}>
            <label htmlFor="email" className={styles["label"]}>
              Adresse email du membre *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="exemple@email.com"
              className={`${styles["input"]} ${
                displayError ? styles["inputError"] : ""
              }`}
              disabled={loading}
              autoFocus
              required
            />
            {displayError && (
              <span className={styles["errorText"]}>{displayError}</span>
            )}
          </div>

          {success && (
            <div className={styles["successMessage"]}>
              <div className={styles["successIcon"]}>✓</div>
              <div className={styles["successContent"]}>
                <p className={styles["successTitle"]}>Invitation envoyée !</p>
                <p className={styles["successDescription"]}>{success}</p>
              </div>
            </div>
          )}

          <div className={styles["infoBox"]}>
            <div className={styles["infoIcon"]}>ℹ️</div>
            <div className={styles["infoContent"]}>
              <p className={styles["infoTitle"]}>À propos des invitations</p>
              <p className={styles["infoDescription"]}>
                L'invitation sera envoyée à l'adresse email saisie. La personne
                recevra un lien pour rejoindre l'espace de travail.
              </p>
            </div>
          </div>

          <div className={styles["modalActions"]}>
            <button
              type="button"
              onClick={handleClose}
              className={styles["cancelButton"]}
              disabled={loading}
            >
              {success ? "Fermer" : "Annuler"}
            </button>
            {!success && (
              <button
                type="submit"
                className={styles["inviteButton"]}
                disabled={loading || !email.trim()}
              >
                {loading ? "Envoi..." : "Envoyer l'invitation"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteWorkspaceModal;
