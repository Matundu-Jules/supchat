import React from "react";
import { useParams } from "react-router-dom";
import { useWorkspaceDetails } from "@hooks/useWorkspaceDetails";
import styles from "./WorkspaceDetailPage.module.scss";

const WorkspaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    workspace,
    loading,
    error,
    inviteEmail,
    setInviteEmail,
    inviteLoading,
    joinCode,
    setJoinCode,
    joinLoading,
    handleInvite,
    handleJoin,
  } = useWorkspaceDetails(id || "");

  if (loading) {
    return <p className={styles["container"]}>Chargement...</p>;
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
      <h1 className={styles["title"]}>{workspace.name}</h1>
      {workspace.description && <p>{workspace.description}</p>}

      <div className={styles["section"]}>
        <h2>Canaux</h2>
        {workspace.channels && workspace.channels.length ? (
          <ul className={styles["list"]}>
            {workspace.channels.map((ch: any) => (
              <li key={ch._id || ch}>{ch.name || ch}</li>
            ))}
          </ul>
        ) : (
          <p>Aucun canal.</p>
        )}
      </div>

      <div className={styles["section"]}>
        <h2>Membres</h2>
        {workspace.members && workspace.members.length ? (
          <ul className={styles["list"]}>
            {workspace.members.map((m: any) => (
              <li key={m._id || m}>{m.username || m.email || m}</li>
            ))}
          </ul>
        ) : (
          <p>Aucun membre.</p>
        )}
      </div>

      <div className={styles["section"]}>
        <h3>Inviter un membre</h3>
        <div className={styles["form"]}>
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Email"
          />
          <button onClick={handleInvite} disabled={inviteLoading}>
            {inviteLoading ? "Envoi..." : "Inviter"}
          </button>
        </div>
      </div>

      <div className={styles["section"]}>
        <h3>Rejoindre via code</h3>
        <div className={styles["form"]}>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Code d'invitation"
          />
          <button onClick={handleJoin} disabled={joinLoading}>
            {joinLoading ? "Rejoindre..." : "Rejoindre"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default WorkspaceDetailPage;
