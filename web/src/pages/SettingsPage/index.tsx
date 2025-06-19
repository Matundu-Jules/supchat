import React, { useState } from "react";
import { getAvatarUrl } from "@utils/avatarUtils";
import { useSettingsHandlers } from "@hooks/useSettingsHandlers";
import PasswordChangeModal from "@components/PasswordChangeModal";
import styles from "./SettingsPage.module.scss";

const SettingsPage: React.FC = () => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const {
    // États
    user,
    theme,
    name,
    setName,
    email,
    avatar,
    isEditingProfile,
    integrations,
    // Actions du profil
    handleSaveProfileWithFeedback,
    handleAvatarChangeWithFeedback,
    handleDeleteAvatarWithFeedback,
    startEditingProfile,
    cancelEditingProfile,
    // Actions du thème
    handleThemeToggleWithFeedback,
    // Actions des intégrations
    handleLinkDriveWithPrompt,
    handleUnlinkDriveWithFeedback,
    handleLinkGithubWithPrompt,
    handleUnlinkGithubWithFeedback,
    // Actions de sécurité
    handleLogoutAllWithFeedback,
    handleExportWithFeedback,
    handleDeleteAccountWithConfirmation,
  } = useSettingsHandlers();

  if (!user) return null;

  return (
    <section className={styles["settingsPage"]}>
      <div className={styles["container"]}>
        <header className={styles["pageHeader"]}>
          <h1>Paramètres</h1>
          <p>Gérez votre profil et vos préférences</p>
        </header>

        <div className={styles["settingsList"]}>
          {" "}
          {/* Section Profil */}
          <section className={styles["settingsSection"]}>
            <h2>👤 Profil utilisateur</h2>
            {/* Section Avatar - TOUJOURS visible */}
            <div className={styles["avatarSection"]}>
              {" "}
              <div className={styles["avatarContainer"]}>
                {(avatar && avatar !== "") ||
                (user?.avatar && user?.avatar !== "") ? (
                  <img
                    src={
                      getAvatarUrl(
                        avatar || user?.avatar,
                        !!user?.avatarUpdatedAt
                      ) || ""
                    }
                    alt="Avatar"
                    className={styles["avatar"]}
                  />
                ) : (
                  <div className={styles["avatarPlaceholder"]}>
                    {name
                      ? name.charAt(0).toUpperCase()
                      : user?.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>{" "}
              {/* Boutons avatar - TOUJOURS visibles */}
              <div className={styles["avatarButtons"]}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    handleAvatarChangeWithFeedback(e.target.files[0])
                  }
                  style={{ display: "none" }}
                  id="avatar-upload"
                />
                <button
                  onClick={() =>
                    document.getElementById("avatar-upload")?.click()
                  }
                  className={styles["btn-secondary"]}
                >
                  {avatar ? "Changer l'avatar" : "Ajouter un avatar"}
                </button>{" "}
                {/* Bouton supprimer - seulement si on a un avatar */}
                {((avatar && avatar !== "") ||
                  (user?.avatar && user?.avatar !== "")) && (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          "Êtes-vous sûr de vouloir supprimer votre avatar ?"
                        )
                      ) {
                        handleDeleteAvatarWithFeedback();
                      }
                    }}
                    className={styles["btn-delete"]}
                  >
                    Supprimer l'avatar
                  </button>
                )}
              </div>
            </div>{" "}
            {!isEditingProfile ? (
              <div className={styles["profileView"]}>
                {" "}
                <div className={styles["profileInfo"]}>
                  <div className={styles["infoItem"]}>
                    <strong>Nom d'affichage</strong>
                    <span>{name}</span>
                  </div>
                  <div className={styles["infoItem"]}>
                    <strong>Email</strong>
                    <span>{email}</span>
                  </div>{" "}
                  <div className={styles["infoItem"]}>
                    <strong>Mot de passe</strong>
                    <span>{"•".repeat(12)}</span>
                  </div>
                </div>
                <div className={styles["profileActions"]}>
                  <button
                    onClick={startEditingProfile}
                    className={styles["btnProfileInfo"]}
                  >
                    <i className="fa-solid fa-edit"></i>
                    Modifier le profil
                  </button>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className={styles["btnPasswordChange"]}
                  >
                    <i className="fa-solid fa-key"></i>
                    {user?.hasPassword
                      ? "Changer le mot de passe"
                      : "Définir un mot de passe"}
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles["profileEdit"]}>
                <div className={styles["editHeader"]}>
                  <h3>✏️ Mode édition</h3>
                  <span className={styles["editIndicator"]}>
                    Edition en cours
                  </span>
                </div>{" "}
                <div className={styles["editForm"]}>
                  <div className={styles["field"]}>
                    <label htmlFor="edit-name">Nom d'affichage</label>
                    <input
                      id="edit-name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Votre nom"
                      className={styles["input"]}
                    />
                  </div>

                  <div className={styles["field"]}>
                    <label htmlFor="edit-email">Email</label>
                    <input
                      id="edit-email"
                      name="email"
                      type="email"
                      value={email}
                      readOnly
                      disabled
                      placeholder="votre@email.com"
                      className={styles["disabledField"]}
                    />
                    <small className={styles["fieldNote"]}>
                      📧 L'email ne peut pas être modifié pour des raisons de
                      sécurité
                    </small>{" "}
                  </div>

                  <div className={styles["editActions"]}>
                    <button
                      onClick={handleSaveProfileWithFeedback}
                      className={styles["btnPrimary"]}
                    >
                      Sauvegarder les modifications
                    </button>
                    <button
                      onClick={cancelEditingProfile}
                      className={styles["btnSecondary"]}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
          {/* Section Apparence */}
          <section className={styles["settingsSection"]}>
            <h2>🎨 Apparence</h2>
            <div className={styles["themeSection"]}>
              <div className={styles["themeInfo"]}>
                <strong>Thème</strong>
                <p>Choisissez entre le mode clair et sombre</p>
              </div>
              <button
                onClick={handleThemeToggleWithFeedback}
                className={styles["btn"]}
              >
                {theme === "light" ? "🌙 Mode sombre" : "☀️ Mode clair"}
              </button>
            </div>
          </section>
          {/* Section Intégrations */}
          <section className={styles["settingsSection"]}>
            <h2>🔗 Intégrations</h2>
            <div className={styles["integrationsList"]}>
              <div className={styles["integration"]}>
                <div className={styles["integrationInfo"]}>
                  <span className={styles["integrationIcon"]}>
                    <i className="fa-brands fa-google-drive"></i>
                  </span>
                  <div>
                    <strong>Google Drive</strong>
                    <p
                      className={
                        integrations.googleDrive
                          ? styles["connected"]
                          : styles["disconnected"]
                      }
                    >
                      {integrations.googleDrive ? "Connecté" : "Déconnecté"}
                    </p>
                  </div>
                </div>
                {integrations.googleDrive ? (
                  <button
                    onClick={handleUnlinkDriveWithFeedback}
                    className={styles["btn"]}
                  >
                    Déconnecter
                  </button>
                ) : (
                  <button
                    onClick={handleLinkDriveWithPrompt}
                    className={styles["btn"]}
                  >
                    Connecter
                  </button>
                )}
              </div>

              <div className={styles["integration"]}>
                <div className={styles["integrationInfo"]}>
                  <span className={styles["integrationIcon"]}>
                    <i className="fa-brands fa-github"></i>
                  </span>
                  <div>
                    <strong>GitHub</strong>
                    <p
                      className={
                        integrations.github
                          ? styles["connected"]
                          : styles["disconnected"]
                      }
                    >
                      {integrations.github ? "Connecté" : "Déconnecté"}
                    </p>
                  </div>
                </div>
                {integrations.github ? (
                  <button
                    onClick={handleUnlinkGithubWithFeedback}
                    className={styles["btn"]}
                  >
                    Déconnecter
                  </button>
                ) : (
                  <button
                    onClick={handleLinkGithubWithPrompt}
                    className={styles["btn"]}
                  >
                    Connecter
                  </button>
                )}
              </div>
            </div>
          </section>
          {/* Section Sécurité */}
          <section className={styles["settingsSection"]}>
            <h2>🔐 Sécurité & Données</h2>
            <div className={styles["securityActions"]}>
              <button
                onClick={handleLogoutAllWithFeedback}
                className={styles["btn"]}
              >
                Déconnexion globale
              </button>
              <button
                onClick={handleExportWithFeedback}
                className={styles["btn"]}
              >
                Exporter mes données
              </button>
            </div>

            <div className={styles["dangerZone"]}>
              <h3>Zone dangereuse</h3>{" "}
              <p>
                Cette action est irréversible. Toutes vos données seront
                définitivement supprimées.
              </p>
              <button
                onClick={handleDeleteAccountWithConfirmation}
                className={styles["buttonDanger"]}
              >
                Supprimer mon compte
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Modal de changement de mot de passe */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </section>
  );
};

export default SettingsPage;
