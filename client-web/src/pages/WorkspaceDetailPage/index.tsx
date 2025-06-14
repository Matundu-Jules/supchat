import React from "react";
import { useParams } from "react-router-dom";
import { useWorkspaceDetails } from "@hooks/useWorkspaceDetails";
import styles from "./WorkspaceDetailPage.module.scss";
import Loader from "@components/Loader";

const WorkspaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    workspace,
    loading,
    error,
    inviteEmail,
    setInviteEmail,
    inviteLoading,
    inviteError,
    inviteSuccess,
    joinCode,
    setJoinCode,
    joinLoading,
    handleInvite,
    handleJoin,
  } = useWorkspaceDetails(id || "");

  if (loading) {
    return (
      <div className={styles["container"]}>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles["container"]}>
        <p className={styles["error"]}>{error}</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className={styles["container"]}>
        <p className={styles["error"]}>Workspace introuvable.</p>
      </div>
    );
  }

  return (
    <section className={styles["container"]}>
      <div className={styles["header"]}>
        <h1 className={styles["title"]}>{workspace.name}</h1>
        {workspace.isPublic !== undefined && (
          <span
            className={
              workspace.isPublic
                ? styles["badgePublic"]
                : styles["badgePrivate"]
            }
          >
            {workspace.isPublic ? "Public" : "Privé"}
          </span>
        )}
      </div>
      {workspace.description && (
        <p className={styles["description"]}>{workspace.description}</p>
      )}

      {/* Section membres */}
      <div className={styles["sectionGrid"]}>
        <div className={styles["section"]}>
          <h2>Membres</h2>
          <ul className={styles["list"]}>
            {workspace.members && workspace.members.length > 0 ? (
              workspace.members.map((member: any) => (
                <li key={member._id} className={styles["memberName"]}>
                  {member.username || member.email}
                </li>
              ))
            ) : (
              <li className={styles["empty"]}>Aucun membre</li>
            )}
          </ul>
        </div>

        {/* Section invitation (visible seulement pour owner/admin) */}
        {workspace.owner &&
          (window?.__USER__?.role === "admin" ||
            window?.__USER__?._id === workspace.owner._id ||
            window?.__USER__?.email === workspace.owner.email) && (
            <div className={styles["section"]}>
              <h2>Inviter un membre</h2>
              <form
                className={styles["form"]}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleInvite();
                }}
                autoComplete="off"
              >
                <input
                  type="email"
                  placeholder="Email du membre"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    // Réinitialise le message de succès à chaque saisie
                    if (inviteSuccess) setInviteSuccess(null);
                  }}
                  className={
                    styles["input"] +
                    (inviteError ? " " + styles["inputError"] : "")
                  }
                  required
                  disabled={inviteLoading}
                />
                <button
                  type="submit"
                  className={styles["button"]}
                  disabled={inviteLoading}
                >
                  {inviteLoading ? "Envoi..." : "Inviter"}
                </button>
              </form>
              {inviteError && (
                <div className={styles["error"]}>{inviteError}</div>
              )}
              {inviteSuccess && !inviteError && (
                <div className={styles["success"]}>{inviteSuccess}</div>
              )}
            </div>
          )}
      </div>
    </section>
  );
};

export default WorkspaceDetailPage;
